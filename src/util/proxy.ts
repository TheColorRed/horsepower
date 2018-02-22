namespace hp {
  export class proxy {

    public static createScope(element: HTMLElement | Document) {
      return this.proxyify(element, new Object)
    }

    private static proxyify(element: HTMLElement | Document, scope: any, propname?: string) {
      scope = new Proxy(scope, {
        set: (target, property, value) => {
          let prop = property.toString()
          let oldValue = target[prop]
          if (Array.isArray(value)) {
            value = this.proxyify(element, value, prop)
          }
          Reflect.set(target, property, value)
          // console.log(target, property, oldValue, value)
          if (oldValue == value) return true
          let newValue = Array.isArray(target) ? target : value
          this.sendScopeEvents(element, propname || prop, newValue, oldValue)
          this.sendBindEvents(element, propname || prop, newValue, oldValue)
          return true
        },
        get: (target, prop) => { return Reflect.get(target, prop) }
      })
      component.scopes.push({ element, scope })
      return scope
    }

    private static sendScopeEvents(element: HTMLElement | Document, prop: string, newValue: any, oldValue: any) {
      component.components.forEach(c => {
        if (c.element == element || element instanceof Document) {
          let fname = `onScope${hp.snakeToCamel(prop).replace(/^(.)/, v => v.toUpperCase())}`
          typeof c[fname] == 'function' && c[fname](newValue, oldValue)
          typeof c.onScope == 'function' && c.onScope(newValue, oldValue, prop)
        }
      })
    }

    private static sendBindEvents(element: HTMLElement | Document, prop: string, newValue: any, oldValue: any) {
      let elements = Array.from(element.querySelectorAll('[hp-bind]'))
      element instanceof HTMLElement && element.hasAttribute('hp-bind') && elements.push(element)
      elements.forEach(el => {
        let attr = el.getAttribute('hp-bind')
        if (attr == prop) {
          if (component.isFormItem(el)) {
            el.value = newValue
          } else {
            el.innerHTML = newValue
          }
          component.components.forEach(c => {
            if (c.element == el) {
              let fname = `onBinding${hp.snakeToCamel(prop).replace(/^(.)/, v => v.toUpperCase())}`
              typeof c[fname] == 'function' && c[fname](newValue, oldValue)
              typeof c.onBinding == 'function' && c.onBinding(newValue, oldValue, prop)
            }
          })
        }
      })
    }
  }
}
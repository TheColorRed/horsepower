namespace hp.core {

  export class proxy {

    public static createScope(element: Element | Document) {
      return this.proxyify(new Object, element)
    }

    public static proxyify(scope: any, element?: Element | Document, propname?: string) {
      scope = new Proxy(scope, {
        apply: (target, thisArg, argArray) => {
          return Reflect.apply(target, thisArg, argArray)
        },
        set: (target, property, value) => {
          let prop = property.toString()
          let oldValue = target[prop]
          if (Array.isArray(value)) {
            value = this.proxyify(value, element, prop)
            // return Reflect.set(target, property, value)
          }
          // target[prop] = value
          Reflect.set(target, property, value)
          // console.log('set')
          // console.log(target, property, oldValue, value)
          if (oldValue == value) return true
          let newValue = Array.isArray(target) ? target : value
          if (element) {
            this.sendScopeEvents(element, propname || prop, newValue, oldValue)
            this.sendBindEvents(element, propname || prop, newValue, oldValue)
            this.sendForEvents(element, propname || prop, newValue, oldValue)
          }
          return true
        },
        get: (target, prop) => {
          // console.log('get')
          // return target[prop]
          return Reflect.get(target, prop)
        }
      })
      if (element) {
        component.scopes.push({ element, scope })
      }
      return scope
    }

    private static sendScopeEvents(element: Element | Document | undefined, prop: string, newValue: any, oldValue: any) {
      if (!element) return
      component.components.forEach(c => {
        if (c.element == element || element instanceof Document) {
          let fname = `onScope${hp.snakeToCamel(prop).replace(/^(.)/, v => v.toUpperCase())}`
          typeof c[fname] == 'function' && c[fname](newValue, oldValue)
          typeof c.onScope == 'function' && c.onScope(newValue, oldValue, prop)
        }
      })
    }

    private static sendBindEvents(element: Element | Document | undefined, prop: string, newValue: any, oldValue: any) {
      if (!element) return
      let elements = Array.from(<NodeListOf<Element>>element.getElementsByTagName('*'))
      element instanceof Element && elements.push(element)
      elements.filter(el => {
        if (el.hasAttribute('hp-bind')) return true
        else {
          let attrs = Array.from(el.attributes)
          for (let i = 0; i < attrs.length; i++) {
            if (attrs[i].value.match(`{{.*?${prop}.*?}}`)) { return true }
          }
          return false
        }
      })
      element instanceof Element && element.hasAttribute('hp-bind') && elements.push(element)
      elements.forEach(el => {
        let attr = el.getAttribute('hp-bind')
        let origAttr = attr
        let key = '', val = ''
        if (attr) {
          [key, val] = attr.split('.')
          if (key == prop) attr = val
        }
        let inlineBindings = this.getInlineBindings(el, origAttr || prop)
        // console.log(hasInlineBindings)
        if (attr == prop || key == prop || inlineBindings.length > 0) {
          // console.log(prop, attr, origAttr, key, newValue)
          // console.log(inlineBindings)
          inlineBindings && this.replaceInlineBindings(el, origAttr || prop, inlineBindings, newValue)
          if (attr == prop || origAttr == prop) {
            if (component.isFormItem(el)) {
              el.value = newValue
            } else {
              el.innerHTML = newValue
            }
          } else if (key == prop) {
            if (component.isFormItem(el)) {
              el.value = attr && newValue[attr]
            } else {
              el.innerHTML = attr && newValue[attr]
            }
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

    private static sendForEvents(element: Element | Document | undefined, prop: string, newValue: any, oldValue: any) {
      if (!element) return
      if (Array.isArray(newValue)) {
        let templs = core.template.templates.filter(t => t.element.hasAttribute('hp-for'))
        templs.forEach(templ => {
          if (templ.element.hasAttribute('hp-for')) {
            let elfor = templ.element.getAttribute('hp-for') || ''
            let [value, source] = elfor.split('in').map(i => i.trim())
            let [arg1, arg2] = value.split(',')
            let key = arg1 && arg2 ? arg1 : null
            let val = arg1 && !arg2 ? arg1 : arg2
            if (Array.isArray(newValue) && source == prop && templ.parent) {
              Array.from(templ.parent.children).forEach(child => component.destory(child as Element))
              newValue.forEach(itmValue => {
                let newElement = templ.element.cloneNode(true) as Element
                newElement.removeAttribute('hp-for')
                this.sendBindEvents(newElement, key || val, itmValue, null)
                templ.parent && templ.parent.appendChild(newElement)
              })
            }
          }
        })
      }
    }

    private static replaceInlineBindings(element: Element, prop: string, keys: string[], newValue: any) {
      let elements: Element[] = Array.from(element.querySelectorAll('*'))
      elements.push(element)
      for (let e = 0; e < elements.length; e++) {
        let el = elements[e]
        let attrs = el.attributes
        // Test the attributes
        for (let i = 0; i < attrs.length; i++) {
          // console.log(prop, keys, newValue)
          keys.forEach(key => {
            let prop = key.split('.')[1]
            attrs[i].value = attrs[i].value.replace(new RegExp(`{{.*?${escapeRegExp(key)}.*?}}`, 'g'), newValue[prop])
          })
          // attrs[i].value = attrs[i].value.replace(new RegExp(`{{.*?}}`, 'g'), '')
          attrs[i].value = attrs[i].value.replace(new RegExp(`{{.*?${escapeRegExp(prop)}.*?}}`, 'g'), newValue)
          // }
        }
        // Test the text content
        el.innerHTML = el.innerHTML.replace(new RegExp(`{{.*?}}`, 'g'), '')
        // el.innerHTML = el.innerHTML.replace(new RegExp(`{{.*?${escapeRegExp(prop)}.*?}}`, 'g'), newValue)
      }
    }

    private static getInlineBindings(element: Element, prop: string) {
      let elements: Element[] = Array.from(element.querySelectorAll('*'))
      elements.push(element)
      let bindings: string[] = []
      for (let e = 0; e < elements.length; e++) {
        let el = elements[e] as HTMLElement
        let attrs = el.attributes
        // Test the attributes
        for (let i = 0; i < attrs.length; i++) {
          let matches = attrs[i].value.match(/({{.+?}})/g)
          if (matches) {
            bindings = bindings.concat(matches)
          }
        }
        // Test the text content
        if (new RegExp(`{{.*?${escapeRegExp(prop)}.*?}}`, 'g').test(el.innerText)) {
          bindings.push(`{{${prop}}}`)
        }
      }
      return bindings.map(b => b.replace(/^{{/, '').replace(/}}$/, ''))
    }
  }
}
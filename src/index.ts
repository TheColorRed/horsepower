namespace hp {

  let domLoaded: boolean = false

  export function observe<T extends component>(comp: componentType<T>, ...selectors: string[]) {
    component.observers.push(new Observer(comp, ...selectors))
    // Run the component global ticker
    if (!domLoaded) {
      domLoaded = true
      document.addEventListener('DOMContentLoaded', () => {
        let componentExists = component.components.find(c => c instanceof comp)
        if (!componentExists) {
          let staticTick = comp.tick(component.components.filter(c => c instanceof comp))
          if (typeof staticTick == 'number') {
            comp.runStaticTick(comp, staticTick)
          }
        }
      })
    }

    if (component.observer) return
    component.observer = new MutationObserver(mutationList => {
      mutationList.forEach(mutation => {
        let target = mutation.target as HTMLElement
        if (mutation.type == 'childList') {
          component.observers.forEach(observer => {
            let items = Array.from(document.body.querySelectorAll<HTMLElement>(observer.selectors.join(',')))
            items.forEach(item => component.createNewComponent(item, observer.component, mutation))
          })
          if (mutation.addedNodes.length > 0) {
            component.components.filter(c => c.element == target).forEach(c => { typeof c.childrenAdded == 'function' && c.childrenAdded(mutation.addedNodes) })
          }
          if (mutation.removedNodes.length > 0) {
            component.components.filter(c => c.element == target).forEach(c => typeof c.childrenRemoved == 'function' && c.childrenRemoved(mutation.removedNodes))
          }
        } else if (mutation.type == 'attributes') {
          component.components.filter(comp => comp.element == target).forEach(c => {
            if (mutation.attributeName) {
              let newattr = target.getAttribute(mutation.attributeName)
              if (c.hasCreated && mutation.oldValue != newattr) {
                typeof c.modified == 'function' && c.modified(mutation.oldValue, newattr, mutation.attributeName, mutation)
              }
            }
          })
        }
      })
    })
    component.observer.observe(document, {
      childList: true, subtree: true,
      attributes: true, attributeOldValue: true
    })
  }

  // const proxyValues: { [key: string]: any } = {}
  // const proxy: Object = function (parent: any) {
  //   return createDeepProxy(proxyValues, {
  //     set(obj, prop, value) {
  //       if (typeof parent['changed'] == 'function') {
  //         let propval = prop.valueOf()
  //         if ((Array.isArray(propval) && propval.indexOf('length') == -1) || !Array.isArray(obj)) {
  //           parent['changed'](prop.valueOf() as any, value)
  //         }
  //       }
  //       return Reflect.set(obj, prop, value)
  //     }
  //   })
  // }

  export function watch(item: { [key: string]: any }): proxy
  export function watch(key: string, value: any): proxy
  export function watch(...args: any[]): proxy {
    let prox = new proxy()
    if (args.length == 2) {
      prox[args[0]] = args[1]
    } else if (args.length == 1 && args[0] instanceof Object) {
      for (let itm in args[0]) {
        !(itm in prox) && (prox[itm] = args[0][itm])
      }
    }
    return prox
  }

}
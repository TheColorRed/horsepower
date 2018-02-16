namespace hp {

  let domLoaded: boolean = false

  export function observe<T extends element>(selector: string | HTMLElement | Document | Window, ...comps: componentType<T>[]): void {
    comps.forEach(comp => {
      component.observers.push(new observer(comp, selector))
      if (selector instanceof Document || selector instanceof Window) {
        component.createNewComponent(selector, comp)
      }
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

      // If the mutation observer has already been created dont create it again
      if (component.observer) return
      // If the mutation observer has not been created create one
      component.observer = new MutationObserver(mutationList => {
        mutationList.forEach(mutation => {
          let target = mutation.target as HTMLElement
          if (mutation.type == 'childList') {
            component.observers.forEach(observer => {
              let items: HTMLElement[] = []
              if (typeof observer.selector == 'string') {
                items = Array.from(document.body.querySelectorAll<HTMLElement>(observer.selector))
              } else if (observer.selector instanceof HTMLElement) {
                items.push(observer.selector)
              }
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
    })
  }

  export function watch<T extends object>(item: T): proxy & T
  export function watch<K extends string, V>(key: K, value: V): proxy & Record<K, V>
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
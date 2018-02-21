namespace hp {

  let domLoaded: boolean = false

  export function observe<T extends element>(selector: string | HTMLElement | Document | Window, ...comps: componentType<T>[]): void {
    comps.forEach(comp => {
      component.observers.push(new observer(comp, selector))
      // Run the component global ticker
      if (!domLoaded) {
        domLoaded = true
        document.addEventListener('DOMContentLoaded', () => {
          if (selector instanceof Document || selector instanceof Window) {
            component.createNewComponent(selector, comp)
          }
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
                items = Array.from(document.querySelectorAll<HTMLElement>(observer.selector))
              } else if (observer.selector instanceof HTMLElement) {
                items.push(observer.selector)
              }
              items.forEach(item =>
                component.components.filter(c => c.element == item).length == 0 &&
                component.createNewComponent(item, observer.component, mutation)
              )
            })
            if (mutation.addedNodes.length > 0) {
              component.components.filter(c => c.element == target).forEach(c => {
                typeof c.childrenAdded == 'function' && c.childrenAdded(mutation.addedNodes)
                typeof c.childrenChanged == 'function' && c.childrenChanged(mutation.addedNodes)
              })
            }
            if (mutation.removedNodes.length > 0) {
              component.components.filter(c => c.element == target).forEach(c => {
                let removed = Array.from(mutation.removedNodes)
                component.components.filter(comp => removed.indexOf(comp.element) > -1).forEach(comp => {
                  // Call removed on the component if it exists
                  typeof comp.removed == 'function' && comp.removed()
                  // Remove the scope from the element if there is one
                  let idx = component.scopes.findIndex(s => s.element == comp.element)
                  idx > -1 && component.scopes.splice(idx, 1)
                })
                typeof c.childrenRemoved == 'function' && c.childrenRemoved(mutation.removedNodes)
                typeof c.childrenChanged == 'function' && c.childrenChanged(mutation.removedNodes)
              })
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
}
namespace hp {

  interface mutationElement<T extends element> {
    element: HTMLElement, component: componentType<T>
  }

  let domLoaded: boolean = false

  export const rootScope = component.rootScope

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
        let creatableElements: mutationElement<T>[] = []
        mutationList.forEach(mutation => {
          let target = mutation.target as HTMLElement
          if (mutation.type == 'childList') {
            if (mutation.addedNodes.length > 0) {
              mutation.addedNodes.forEach(node => {
                if (node.nodeType == 1) {
                  component.observers.forEach(o => {
                    if (typeof o.selector == 'string') {
                      let elements = <HTMLElement[]>Array.from(document.querySelectorAll(o.selector))
                      elements.forEach(e => creatableElements.findIndex(i => i.element == e) == -1 && creatableElements.push({ element: e, component: o.component }))
                    } else if (o.selector instanceof HTMLElement) {
                      creatableElements.push({ element: o.selector, component: o.component })
                    }
                  })
                }
              })
            }
            if (mutation.removedNodes.length > 0) {
              component.components.filter(c => c.element == target).forEach(c => {
                let removed = Array.from(mutation.removedNodes)
                component.components.filter(comp => removed.indexOf(comp.element) > -1).forEach(comp => {
                  // Call removed on the component if it exists
                  typeof comp.removed == 'function' && comp.removed()
                  // Destory the components associated with the element
                  component.destory(comp.element)
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
        let toCreate = creatableElements.reduce<mutationElement<T>[]>((nodes, n) =>
          nodes.findIndex(i => i.element == n.element) == -1 &&
            !component.components.find(c => c.element == n.element)
            ? nodes.concat(n) : nodes, [])
        toCreate.forEach(item => {
          component.createNewComponent(item.element, transform)
          component.createNewComponent(item.element, item.component)
        })
      })
      component.observer.observe(document, {
        childList: true, subtree: true,
        attributes: true, attributeOldValue: true
      })
    })
  }
}
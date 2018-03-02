namespace hp.core {

  export class observer<T extends element> {
    public readonly component: componentType<T>
    public readonly selector: string | hpElement

    public constructor(component: componentType<T>, selectors: string | hpElement) {
      this.component = component
      this.selector = selectors
    }
  }

  export class mutationObserver {

    public static observer: MutationObserver

    public static masterObserver(options: MutationObserverInit) {
      if (this.observer) return
      this.observer = this.create()
      this.observer.observe(document, options)
    }

    private static testNode(node: Element) {
      component.observers.forEach(o => {
        if (typeof o.selector == 'string' && node.matches(o.selector)) {
          let idx = component.elements.findIndex(i => i == node)
          idx == -1 && component.elements.push(node as Element)
          if (idx > -1) return
          createNewComponent(node as Element, o.component)
        }
      })
    }

    public static create() {
      return new MutationObserver(mutationList => {
        mutationList.forEach(mutation => {
          let target = mutation.target as Element
          if (mutation.type == 'childList') {
            mutation.addedNodes.forEach(node => {
              if (node instanceof Element) {
                let nodes = Array.from(node.querySelectorAll('*'))
                nodes.push(node)
                nodes.forEach(n => {
                  this.testNode(n)
                })
              }
            })
            if (mutation.removedNodes.length > 0) {
              mutation.removedNodes.forEach(node => {
                if (node.nodeType == 1) {
                  component.components.filter(c => c.element == node).forEach(c => {
                    let removed = Array.from(mutation.removedNodes)
                    component.components.filter(comp => removed.indexOf(comp.element) > -1).forEach(comp => {
                      // Call removed on the component if it exists
                      typeof comp.removed == 'function' && comp.removed()
                      // Destory the components associated with the element
                      component.destory(comp.element)
                      component.components.forEach((c: any) => c.element == comp.element && (c['_node'] = null))
                      // Remove the scope from the element if there is one
                      let idx = component.scopes.findIndex(s => s.element == comp.element)
                      idx > -1 && component.scopes.splice(idx, 1)
                      // Remove the element from the elements array
                      let elidx = component.elements.findIndex(i => i == comp.element)
                      elidx == -1 && component.elements.splice(elidx, 1)
                      removeEmptyComponents()
                    })
                    typeof c.childrenRemoved == 'function' && c.childrenRemoved(mutation.removedNodes)
                    typeof c.childrenChanged == 'function' && c.childrenChanged(mutation.removedNodes)
                  })
                }
              })
            }
          } else if (mutation.type == 'attributes') {
            component.components.filter(comp => comp.element == target).forEach(comp => {
              if (mutation.attributeName) {
                this.dsabledPropChanged(comp)
                let newattr = target.getAttribute(mutation.attributeName)
                if (comp.hasCreated && mutation.oldValue != newattr) {
                  typeof comp.modified == 'function' && comp.modified(newattr, mutation.oldValue, mutation.attributeName, mutation)
                }
              }
            })
          }
        })
      })
    }

    private static dsabledPropChanged(comp: component) {
      if (comp instanceof formItem) {
        typeof comp.disabled == 'function' && comp.inactive && comp.disabled()
        typeof comp.enabled == 'function' && !comp.inactive && comp.enabled()
      }
    }
  }

}
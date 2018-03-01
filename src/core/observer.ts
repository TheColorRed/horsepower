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

    public static create(options: MutationObserverInit) {
      if (this.observer) return
      this.observer = new MutationObserver(mutationList => {
        mutationList.forEach(mutation => {
          let target = mutation.target as HTMLElement
          if (mutation.type == 'childList') {
            mutation.addedNodes.forEach(node => {
              if (node instanceof HTMLElement) {
                let nodes = Array.from(node.querySelectorAll('*'))
                nodes.push(node)
                nodes.forEach(n => {
                  component.observers.forEach(o => {
                    let idx = component.elements.findIndex(i => i == n)
                    if (typeof o.selector == 'string' && n.matches(o.selector)) {
                      idx == -1 && component.elements.push(n as HTMLElement)
                      if (idx > -1) return
                      // createNewComponent(item.element, transform)
                      createNewComponent(n as HTMLElement, o.component)
                    }
                  })
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
            component.components.filter(comp => comp.element == target).forEach(c => {
              if (mutation.attributeName) {
                let newattr = target.getAttribute(mutation.attributeName)
                if (c.hasCreated && mutation.oldValue != newattr) {
                  typeof c.modified == 'function' && c.modified(newattr, mutation.oldValue, mutation.attributeName, mutation)
                }
              }
            })
          }
        })

        // creatableElements.forEach(item => {
        //   let idx = component.elements.findIndex(i => i == item.element)
        //   idx == -1 && component.elements.push(item.element)
        //   if (idx > -1) return
        //   // createNewComponent(item.element, transform)
        //   createNewComponent(item.element, item.component)
        // })
      })
      this.observer.observe(document, options)
    }
  }

}
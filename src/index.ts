namespace hp {

  let domLoaded: boolean = false

  export const rootScope = component.rootScope

  // Watch for document mutations
  core.mutationObserver.create({
    childList: true, subtree: true,
    attributes: true, attributeOldValue: true
  })

  export function addTemplate(template: string | Element, data?: any) {
    core.template.add(template, data)
  }

  /**
   * Removes components that don't have elements associated to them
   *
   * @private
   * @memberof element
   */
  export function removeEmptyComponents() {
    let i = component.components.length
    while (i--) {
      let comp = component.components[i]
      if (!comp['_node']) {
        component.components.splice(i, 1)
      }
    }
  }

  export function createNewComponent<T extends element>(element: hpElement, comp: componentType<T>, mutation?: MutationRecord): T {
    let c = new comp(element)
    typeof c.created == 'function' && c.created(mutation)
    c.hasCreated = true
    let newval: any = null
    element instanceof HTMLElement && mutation && mutation.attributeName && (newval = element.getAttribute(mutation.attributeName))
    // component.components.filter(comp => comp.element == element).forEach(c =>
    //   c.hasCreated && typeof c.modified == 'function' && mutation &&
    //   c.modified(newval, mutation.oldValue, mutation.attributeName, mutation)
    // )
    // Run the individual ticker for the component
    if (typeof c.tick == 'function') {
      c.runTick(0)
    }
    return c
  }

  export function getOrCreateComponent<T extends element>(element: hpElement, comp: componentType<T>) {
    let newComp: T = component.components.find(c => c.element == element) as T
    if (!newComp) newComp = createNewComponent(element as HTMLElement, comp)
    return newComp
  }

  export function hasComponents(element: hpElement) {
    return component.components.findIndex(c => c.element == element) > -1
  }

  export function observe<T extends element>(selector: string | hpElement, ...comps: componentType<T>[]): void {
    comps.forEach(comp => {
      component.observers.push(new core.observer(comp, selector))
      // Run the component global ticker
      if (!domLoaded) {
        domLoaded = true
        document.addEventListener('DOMContentLoaded', () => {
          if (selector instanceof Document || selector instanceof Window) {
            createNewComponent(selector, comp)
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
    })
  }
}
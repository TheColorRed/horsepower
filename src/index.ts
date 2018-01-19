// export * from './core/Component'

// declare namespace mutator { }
// declare var module: any
// if (typeof module !== 'undefined' && module.exports) {
//   module.exports = mutator
// } else {
//   (<any>window).mutator = mutator
//   // document.addEventListener('DOMContentLoaded', e => libjs.domReady())
// }

namespace mutator {

  let domloaded: boolean = false

  export function observe<T extends component>(comp: ComponentType<T>, ...selectors: string[]) {
    component.observers.push(new Observer(comp, ...selectors))
    // Run the component global ticker
    if (!domloaded) {
      domloaded = true
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
}
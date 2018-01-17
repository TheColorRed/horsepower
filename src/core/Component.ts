namespace mutator {

  export interface ComponentType<T extends component> {
    new(element?: HTMLElement): T
    tick(components: component[]): void
    runStaticTick(comp: ComponentType<T>, tick?: number): void
  }

  export interface component {
    click(): void
  }

  export class Observer<T extends component> {
    public readonly component: ComponentType<T>
    public readonly selectors: string[]

    public constructor(component: ComponentType<T>, ...selectors: string[]) {
      this.component = component
      this.selectors = selectors
    }
  }

  export function observe<T extends component>(comp: ComponentType<T>, ...selectors: string[]) {
    component.observers.push(new Observer(comp, ...selectors))
    // Run the component global ticker
    document.addEventListener('DOMContentLoaded', () => {
      let componentExists = component.components.find(c => c instanceof comp)
      if (!componentExists) {
        let staticTick = comp.tick(component.components.filter(c => c instanceof comp))
        if (typeof staticTick == 'number') {
          comp.runStaticTick(comp, staticTick)
        }
      }
    })

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
            component.components.filter(c => c.element == target).forEach(c => { c.childrenAdded(mutation.addedNodes) })
          }
          if (mutation.removedNodes.length > 0) {
            component.components.filter(c => c.element == target).forEach(c => c.childrenRemoved(mutation.removedNodes))
          }
        } else if (mutation.type == 'attributes') {
          component.components.filter(comp => comp.element == target).forEach(c => {
            if (mutation.attributeName) {
              let newattr = target.getAttribute(mutation.attributeName)
              if (c.hasCreated && mutation.oldValue != newattr) {
                c.modified(mutation.oldValue, newattr, mutation.attributeName, mutation)
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

  export abstract class component {

    public static observer: MutationObserver
    public static observers: Observer<any>[] = []
    public static components: component[] = []

    public readonly element: HTMLElement
    public hasCreated: boolean = false

    public constructor(element?: HTMLElement) {
      this.element = !element ? document.createElement('div') : element
      component.components.push(this)
    }

    public created(mutation?: MutationRecord) { }
    public modified(oldValue: any, newValue: any, attr: any, mutation?: MutationRecord) { }
    public deleted(mutation?: MutationRecord) { }
    public childrenAdded(children: NodeList) { }
    public childrenRemoved(children: NodeList) { }
    public tick(): any { }
    public static tick(): any { }

    public get childCount(): number { return this.element.childNodes.length }

    public find(selector: string) {
      return this.element.querySelector(selector)
    }

    public closest(selector: string) {
      return this.element.closest(selector)
    }

    public setAttribute(key: string, value: string) {
      this.element.setAttribute(key, value)
    }

    public getAttribute(key: string, fallback?: any): any {
      return this.element.getAttribute(key)
    }

    public textContent(value: any) {
      this.element.textContent = value
      return this
    }

    public value(val: any) {
      if (this.element instanceof HTMLInputElement) {
        this.element.value = val
      }
      return this
    }

    public css(key: string, value: any): this
    public css(items: object): this
    public css(...args: any[]) {
      if (args[0] instanceof Object) {
        for (let key in args[0]) { (<any>this.element.style)[key] = args[0][key] }
      } else {
        this.element.style[args[0]] = args[1]
      }
      return this
    }

    public getInt(key: string, fallback: number = 0) {
      return parseInt(this.getAttribute(key, fallback))
    }

    public getFloat(key: string, fallback: number = 0) {
      return parseFloat(this.getAttribute(key, fallback))
    }

    public getBoolean(key: string, fallback: boolean = false) {
      let val = this.getAttribute(key, fallback) || false
      return val > 0 || val == 'true' || false
    }

    public toggle(key: string) {
      this.setAttribute(key, this.getBoolean(key, false) ? 'false' : 'true')
      return this.getBoolean(key)
    }

    public insert(position: InsertPosition, html: string | HTMLElement) {
      if (html instanceof HTMLElement) {
        return this.element.insertAdjacentElement(position, html)
      } else if (typeof html == 'string') {
        return this.element.insertAdjacentHTML(position, html)
      }
    }

    public append(html: string | HTMLElement) {
      return this.insert('beforeend', html)
    }

    public appendElement<T extends HTMLElement>(element: string, content?: string): T {
      let info = this.parseQuerySelector(element)
      let el = document.createElement(element)
      info.classList.length > 0 && el.classList.add(...info.classList)
      el.textContent = content ? content : ''
      this.append(el)
      return el as T
    }

    public prependElement<T extends HTMLElement>(element: string, content?: string): T {
      let info = this.parseQuerySelector(element)
      let el = document.createElement(info.element)
      info.classList.length > 0 && el.classList.add(...info.classList)
      el.innerHTML = content ? content : ''
      this.prepend(el)
      return el as T
    }

    public prepend(html: string | HTMLElement) {
      return this.insert('afterbegin', html)
    }

    public removeLast() {
      let element = this.element.children.item(this.element.children.length - 1) as HTMLElement
      element && this.removeElement(element)
    }

    public removeFirst() {
      let element = this.element.children.item(0) as HTMLElement
      element && this.removeElement(element)
    }

    public removeElement(element: HTMLElement) {
      element.parentElement && element.parentElement.removeChild(element)
      this.removeEmptyElements()
    }

    private removeEmptyElements() {
      let i = component.components.length
      while (i--) {
        let comp = component.components[i]
        if (!comp.element) {
          component.components.splice(i, 1)
        }
      }
    }

    public getJson(key: string, fallback: Object = {}) {
      let val = this.getAttribute(key) || '{}'
      try {
        return JSON.parse(val)
      } catch (e) {
        return fallback
      }
    }

    private parseQuerySelector(selector: string) {
      let obj: { classList: string[], id: string, element: string } = {
        classList: [],
        id: '',
        element: 'div'
      }
      obj.classList = (selector.match(/\.[a-z-_0-9]+/g) || []).map(v => v.replace('.', ''))
      obj.element = selector.toLowerCase().split(/[^a-z]/)[0] || 'div'
      return obj
      // console.log(matches)
    }

    public findComponent<T extends component>(comp: ComponentType<T>, callback?: (comp: T) => void) {
      let c = component.components.find(c => c instanceof comp) as T
      c instanceof component && typeof callback == 'function' && callback(c)
      return c
    }

    public findComponents<T extends component>(comp: ComponentType<T>, callback?: (comp: T[]) => void) {
      let c = component.components.filter(c => c instanceof comp) as T[]
      typeof callback == 'function' && callback(c)
      return c
    }

    public parentComponent<T extends component>(comp: ComponentType<T>, callback?: (component: T) => void): T | null {
      let parent = this._parentComponent<T>(comp, this.element)
      parent && typeof callback == 'function' && callback(parent)
      return parent
    }

    private _parentComponent<T extends component>(comp: ComponentType<T>, target?: HTMLElement): T | null {
      let parent = target ? target.parentElement : this.element.parentElement
      if (parent) {
        let c = component.components.find(c => c instanceof comp && c.element == parent)
        if (!c) {
          return this._parentComponent(comp, parent)
        }
        return c as T
      }
      return null
    }

    public childComponent<T extends component>(comp: ComponentType<T>, callback?: (item: T) => void): T | null {
      let items = Array.from(this.element.querySelectorAll('*'))
      let c = component.components.find(c => c instanceof comp && items.indexOf(c.element) > -1) as T
      c && typeof callback == 'function' && callback(c)
      return c
    }

    public childComponents<T extends component>(comp: ComponentType<T>) {
      let items = Array.from(this.element.querySelectorAll('*'))
      return component.components.filter(c => c instanceof comp && items.indexOf(c.element) > -1) as T[]
    }

    public static createNewComponent<T extends component>(element: HTMLElement, comp: ComponentType<T>, mutation: MutationRecord) {
      let item = this.components.find(c => c.element == element && c instanceof comp)
      if (!item) {
        let c = new comp(element)
        c.created(mutation)
        c.hasCreated = true
        let newval: any = null
        mutation.attributeName && (newval = element.getAttribute(mutation.attributeName))
        this.components.filter(comp => comp.element == element).forEach(c => c.hasCreated && c.modified(mutation.oldValue, newval, mutation.attributeName, mutation))
        // Run the individual ticker for the component
        let tick = c.tick()
        if (typeof tick == 'number') {
          c.runTick(tick)
        }
        if (typeof c['click'] == 'function') {
          c.element.addEventListener('click', c['click'].bind(c))
        }
      }
    }

    private runTick(tick?: number) {
      if (typeof tick == 'number') {
        setTimeout(() => {
          let tick = this.tick()
          if (typeof tick == 'number') {
            this.runTick(tick)
          }
        }, tick)
      }
    }

    public static runStaticTick<T extends component>(comp: ComponentType<T>, tick?: number) {
      if (typeof tick == 'number') {
        setTimeout(() => {
          let tick = comp.tick(this.components.filter(c => c instanceof comp))
          if (typeof tick == 'number') {
            this.runStaticTick(comp, tick)
          }
        }, tick)
      }
    }

  }
}
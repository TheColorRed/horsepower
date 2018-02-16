namespace hp {

  export interface componentType<T extends element> {
    new(element?: HTMLElement | Document | Window): T
    tick(components: component[]): any
    runStaticTick(comp: componentType<element>, tick?: number): void
  }

  export interface component {
    ajax(data: any): void
    created(mutation?: MutationRecord): void
    modified(oldValue: any, newValue: any, attr: any, mutation?: MutationRecord): void
    changed(newValue: any, oldValue: any, key: string | string[]): void
    deleted(mutation?: MutationRecord): void
    childrenAdded(children: NodeList): void
    childrenRemoved(children: NodeList): void
    tick(): any
    loop(): any
  }

  export class observer<T extends element> {
    public readonly component: componentType<T>
    public readonly selector: string | HTMLElement | Document | Window

    public constructor(component: componentType<T>, selectors: string | HTMLElement | Document | Window) {
      this.component = component
      this.selector = selectors
    }
  }

  export abstract class component {

    private readonly _element: HTMLElement | Document | Window

    public get element(): HTMLElement {
      let el: HTMLElement
      if (this._element instanceof Window) el = this._element.document.body
      else if (this._element instanceof Document) el = this._element.body
      else el = this._element
      return el
    }

    public static observer: MutationObserver
    public static observers: observer<any>[] = []
    public static components: component[] = []

    public hasCreated: boolean = false

    // private boundValues: { [key: string]: any } = {}
    // private proxies: proxy[] = []
    // private proxies: object[] = []
    // private proxy: proxy

    public constructor(element?: HTMLElement | Document | Window) {
      component.components.push(this)
      this._element = !element ? window.document.createElement('div') : element
    }

    // Overwriteable methods
    static tick(): any { }

    public watch(item: { [key: string]: any }): { [key: string]: any }
    public watch(key: string, value: any): typeof value
    public watch(...args: any[]): any {
      // !this.proxy && (this.proxy = new proxy().bind(this))
      let prox = new proxy()
      if (args.length == 2) {
        prox[args[0]] = args[1]
      } else if (args.length == 1 && args[0] instanceof Object) {
        for (let itm in args[0]) {
          !(itm in prox) && (prox[itm] = args[0][itm])
        }
      }
      this.bind(prox)
      return prox
    }

    public bind(...proxies: proxy[]) {
      proxies.forEach(p => p.bind(this))
    }

    public unbind(...proxies: proxy[]) {
      proxies.forEach(p => p.unbind(this))
    }

    /**
     * Gets a specific component attached to the element
     *
     * @static
     * @template T
     * @param {componentType<T>} comp
     * @param {HTMLElement} element
     * @returns
     * @memberof component
     */
    public static elementComponent<T extends element>(comp: componentType<T>, element: HTMLElement) {
      return this.components.find(c => c instanceof comp && c.element == element) as T
    }

    /**
     * Gets an array of a specific component attached to the element
     *
     * @static
     * @template T
     * @param {componentType<T>} comp
     * @param {HTMLElement} element
     * @returns
     * @memberof component
     */
    public static elementComponents<T extends element>(comp: componentType<T>, element: HTMLElement) {
      return this.components.filter(c => c instanceof comp && c.element == element) as T[]
    }

    /**
     * Finds the first instance of a component
     *
     * @template T
     * @param {componentType<T>} comp
     * @param {(comp: T) => void} [callback]
     * @returns {T}
     * @memberof component
     */
    public findComponent<T extends element>(comp: componentType<T>, callback?: (comp: T) => void): T {
      let c = component.components.find(c => c instanceof comp) as T
      c instanceof component && typeof callback == 'function' && callback(c)
      return c
    }

    /**
     * Finds all instances of a component
     *
     * @template T
     * @param {componentType<T>} comp
     * @param {(comp: T[]) => void} [callback]
     * @returns
     * @memberof component
     */
    public findComponents<T extends element>(comp: componentType<T>, callback?: (comp: T) => void): T[] {
      let comps = component.components.filter(c => c instanceof comp) as T[]
      typeof callback == 'function' && comps.forEach(comp => { callback(comp) })
      return comps
    }

    public findElement(selector: string, callback?: (comp: element) => void): element | undefined {
      let el = document.querySelector(selector) as HTMLElement
      let comp: element | undefined
      if (el) {
        comp = component.components.find(c => c.element == el) as element
        if (!comp) {
          comp = component.createNewComponent(el, element)
        }
      }
      typeof callback == 'function' && comp instanceof element && callback(comp)
      return comp as element
    }

    public findElements(selector: string, callback?: (comp: element) => void): element[] {
      let elements: HTMLElement[] = Array.from(document.querySelectorAll(selector))
      let comps: element[] = []
      elements.forEach(el => {
        if (el) {
          let comp = component.components.find(c => c.element == el) as element
          if (!comp) {
            comp = component.createNewComponent(el, element)
          }
          comp instanceof element && comps.push(comp)
          typeof callback == 'function' && comp instanceof element && callback(comp)
        }
      })
      return comps
    }

    /**
     * Finds the first parent with a specific component
     *
     * @template T
     * @param {componentType<T>} comp
     * @param {(component: T) => void} [callback]
     * @returns {(T | null)}
     * @memberof component
     */
    public parentComponent<T extends element>(comp: componentType<T>, callback?: (component: T) => void): T | null {
      let parent = component.components.find(c => c.element == this.element.parentElement) as T
      parent && typeof callback == 'function' && callback(parent)
      return parent
    }

    public parentElement(selector: string, callback?: (comp: element) => void): element | undefined {
      let el = document.querySelector(selector) as HTMLElement
      let parentElement = el ? el.parentElement : null
      let comp: element | undefined
      if (parentElement) {
        let parent = component.components.find(c => c.element == parentElement) as element
        if (!parent) {
          comp = component.createNewComponent(el, element)
        }
      }
      typeof callback == 'function' && comp instanceof element && callback(comp)
      return comp
    }

    /**
     * Finds the first parent with a specific component
     *
     * @template T
     * @param {componentType<T>} comp
     * @param {(component: T) => void} [callback]
     * @returns {(T | null)}
     * @memberof component
     */
    public closestComponent<T extends element>(comp: componentType<T>, callback?: (component: T) => void): T | null {
      let parent = this._closestComponent<T>(comp, this.element)
      parent && typeof callback == 'function' && callback(parent)
      return parent
    }

    private _closestComponent<T extends element>(comp: componentType<T>, target?: HTMLElement): T | null {
      let parent = target ? target.parentElement : this.element.parentElement
      if (parent) {
        let c = component.components.find(c => c instanceof comp && c.element == parent)
        if (!c) {
          return this._closestComponent(comp, parent)
        }
        return c as T
      }
      return null
    }

    public closestElement(selector: string, callback?: (comp: element) => void): element | undefined {
      let parentElement = this.element.closest(selector) as HTMLElement
      let comp: element | undefined
      if (parentElement) {
        comp = component.components.find(c => c.element == parentElement) as element
        if (!comp) {
          comp = component.createNewComponent(parentElement, element)
        }
      }
      typeof callback == 'function' && comp instanceof element && callback(comp)
      return comp
    }

    /**
     * Gets a list of the parents components
     *
     * @param {(components: component[]) => void} callback
     * @returns {component[]}
     * @memberof component
     */
    public parent(callback?: (components: component[]) => void): component[] {
      let components = component.components.filter(c => c.element == this.element.parentElement)
      typeof callback == 'function' && callback(components)
      return components
    }

    public childComponent<T extends element>(comp: componentType<T>, callback?: (item: T) => void): T | null {
      let items = Array.from(this.element.querySelectorAll('*'))
      let c = component.components.find(c => c instanceof comp && items.indexOf(c.element) > -1) as T
      c && typeof callback == 'function' && callback(c)
      return c
    }

    public childComponents<T extends element>(comp: componentType<T>): T[] {
      let items = Array.from(this.element.querySelectorAll('*'))
      return component.components.filter(c => c instanceof comp && items.indexOf(c.element) > -1) as T[]
    }

    /**
     * Gets the first component from one of the siblings
     *
     * @template T
     * @param {componentType<T>} comp
     * @param {(item: T) => void} [callback]
     * @returns {(T | null)}
     * @memberof component
     */
    public siblingComponent<T extends element>(comp: componentType<T>, callback?: (item: T) => void): T | null {
      let c = component.components.find(c => {
        if (this.element instanceof HTMLElement && this.element.parentElement) {
          let nodes = this.element.parentElement.childNodes
          for (let i = 0; i < nodes.length; i++) {
            return c instanceof comp && c.element == nodes[i]
          }
        }
        return false
      }) as T
      c && typeof callback == 'function' && callback(c)
      return c
    }

    /**
     * Gets all componets from the all the siblings exclusive
     *
     * @template T
     * @param {componentType<T>} comp
     * @param {(item: T[]) => void} [callback]
     * @returns {(T[] | null)}
     * @memberof component
     */
    public siblingComponents<T extends element>(comp: componentType<T>, callback?: (item: T[]) => void): T[] | null

    /**
     * Gets all componets from the all the siblings inclusively or exclusively
     *
     * @template T
     * @param {componentType<T>} comp
     * @param {boolean} inclusive
     * @param {(item: T[]) => void} [callback]
     * @returns {(T[] | null)}
     * @memberof component
     */
    public siblingComponents<T extends element>(comp: componentType<T>, inclusive: boolean, callback?: (item: T[]) => void): T[] | null
    public siblingComponents<T extends element>(...args: any[]): T[] | null {
      let comp: componentType<T> = args[0]
      let inclusive = args.length == 3 ? args[1] : false
      let callback = args.length == 3 ? args[2] : args[1]
      let components = component.components.filter(c => {
        if (this.element instanceof HTMLElement && this.element.parentElement) {
          let nodes = this.element.parentElement.childNodes
          for (let i = 0; i < nodes.length; i++) {
            if (inclusive) {
              return c instanceof comp && c.element == nodes[i]
            }
            return c instanceof comp && c.element != this.element && c.element == nodes[i]
          }
        }
        return false
      }) as T[]
      components && typeof callback == 'function' && callback(components)
      return components
    }

    /**
     * Removes components that don't have elements associated to them
     *
     * @private
     * @memberof element
     */
    protected removeEmptyComponents() {
      let i = component.components.length
      while (i--) {
        let comp = component.components[i]
        // console.log(comp.element)
        if (!comp.element) {
          component.components.splice(i, 1)
        }
      }
    }

    public static createNewComponent<T extends element>(element: HTMLElement, comp: componentType<T>, mutation?: MutationRecord): T {
      let item = this.components.find(c => c.element == element && c instanceof comp)
      if (!item) {
        let c = new comp(element)
        typeof c.created == 'function' && c.created(mutation)
        c.hasCreated = true
        let newval: any = null
        mutation && mutation.attributeName && (newval = element.getAttribute(mutation.attributeName))
        this.components.filter(comp => comp.element == element).forEach(c =>
          c.hasCreated && typeof c.modified == 'function' && mutation &&
          c.modified(mutation.oldValue, newval, mutation.attributeName, mutation)
        )
        // Run the individual ticker for the component
        if (typeof c.tick == 'function') {
          c.runTick(0)
        }
        return c
      }
      return item as T
    }

    public startLoop(next: number) {
      if (typeof next == 'number') {
        setTimeout(() => {
          if (typeof this.tick != 'function') return
          next = this.loop() || 0
          if (typeof next == 'number') {
            this.startLoop(next)
          }
        }, next)
      }
    }

    private runTick(next?: number) {
      if (typeof next == 'number') {
        setTimeout(() => {
          if (typeof this.tick != 'function') return
          next = this.tick() || 0
          if (typeof next == 'number') {
            this.runTick(next)
          }
        }, next)
      }
    }

    public static runStaticTick<T extends element>(comp: componentType<T>, tick?: number) {
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
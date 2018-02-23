namespace hp {

  export interface componentType<T extends element> {
    new(element?: HTMLElement | Document | Window): T
    tick(components: component[]): any
    runStaticTick(comp: componentType<element>, tick?: number): void
  }

  export interface component {
    ajaxResponse(data: any): void
    created(mutation?: MutationRecord): void
    removed(): void
    modified(oldValue: any, newValue: any, attr: any, mutation?: MutationRecord): void
    changed(newValue: any, oldValue: any, key: string | string[]): void
    onScope(newValue: any, oldValue: any, prop: string): void
    onBinding(newValue: any, oldValue: any, prop: string): void
    updated(value: any, prop: string): void
    deleted(mutation?: MutationRecord): void
    childrenAdded(children: NodeList): void
    childrenRemoved(children: NodeList): void
    childrenChanged(children: NodeList): void
    keydown(keyboard: keyboard): void
    keyup(keyboard: keyboard): void
    clicked(mouse: mouse): void
    heldDown(mouse: mouse): void
    doubleClicked(mouse: mouse): void
    tick(): any
    loop(): any
    [key: string]: any
  }

  export class observer<T extends element> {
    public readonly component: componentType<T>
    public readonly selector: string | HTMLElement | Document | Window

    public constructor(component: componentType<T>, selectors: string | HTMLElement | Document | Window) {
      this.component = component
      this.selector = selectors
    }
  }

  export interface scope {
    scope: { [key: string]: any }
    element: HTMLElement | Document | Window
  }

  export abstract class component {

    public readonly parent: component | null = null

    private readonly _node: HTMLElement | Document | Window
    private static _keyboard: keyboard = new keyboard
    private static _mouse: mouse = new mouse

    private clicktimeoutid: number = 0

    public get keyboard(): keyboard { return component._keyboard }
    public get mouse(): mouse { return component._mouse }
    public get node(): HTMLElement | Document | Window { return this._node }
    public get element(): HTMLElement {
      let el: HTMLElement
      if (this._node instanceof Window) el = this._node.document.body
      else if (this._node instanceof Document) el = this._node.body
      else el = this._node
      return el
    }

    public static observer: MutationObserver
    public static observers: observer<any>[] = []
    public static components: component[] = []
    private static _rootScope: { [key: string]: any }
    public static scopes: scope[] = []

    public hasCreated: boolean = false

    public constructor(node?: HTMLElement | Document | Window) {
      component.components.push(this)
      this._node = !node ? window.document.createElement('div') : node
      this.node.addEventListener('keydown', this.onKeyDown.bind(this))
      typeof this.keyup == 'function' && this.node.addEventListener('keyup', this.onKeyUp.bind(this))
      typeof this.clicked == 'function' && this.node.addEventListener('click', this.onClicked.bind(this))
      typeof this.doubleClicked == 'function' && this.node.addEventListener('dblclick', this.onDoubleClicked.bind(this))
      if (typeof this.heldDown == 'function') {
        this.node.addEventListener('touchstart', e => this.startClickHold(e as MouseEvent))
        this.node.addEventListener('mousedown', e => this.startClickHold(e as MouseEvent))
        this.node.addEventListener('touchend', e => this.stopClickHold())
        this.node.addEventListener('touchcancel', e => this.stopClickHold())
        this.node.addEventListener('mouseup', e => this.stopClickHold())
        this.node.addEventListener('mouseout', e => this.stopClickHold())
      }
      if (node instanceof HTMLElement) {
        this.parent = this.closestComponent(element)
      }
      this.formElementBinding()
    }

    public get ajax() {
      return {
        get: async (url: string, data?: { [key: string]: any } | FormData, headers?: { [key: string]: any } | Headers) => {
          let response = await hp.ajax.get(url, data, headers)
          component.components.forEach(comp => comp.element == this.element && typeof comp.ajaxResponse == 'function' && comp.ajaxResponse(response))
          return response
        },
        post: async (url: string, data?: { [key: string]: any } | FormData, headers?: { [key: string]: any } | Headers) => {
          let response = await hp.ajax.post(url, data, headers)
          component.components.forEach(comp => comp.element == this.element && typeof comp.ajaxResponse == 'function' && comp.ajaxResponse(response))
          return response
        }
      }
    }

    public get scope(): { [key: string]: any } {
      let scope = component.scopes.find(s => s.element == this.element)
      if (scope) return scope.scope
      return proxy.createScope(this.element)
    }

    public get parentScope(): { [key: string]: any } {
      let c = component.components.find(c => this.parent && c.element == this.parent.element ? true : false)
      if (c && c.scope) return c.scope
      return this.rootScope
    }

    public get rootScope(): { [key: string]: any } {
      if (!component._rootScope) {
        component._rootScope = proxy.createScope(document)
      }
      return component._rootScope
    }

    public static get rootScope(): { [key: string]: any } {
      if (!component._rootScope) {
        component._rootScope = proxy.createScope(document)
      }
      return component._rootScope
    }

    private onKeyDown(e: KeyboardEvent) {
      component['_keyboard'] = new keyboard(e)
      typeof this.keydown == 'function' && this.keyboard && this.keydown(this.keyboard)
    }

    private onKeyUp() {
      this.keyboard && this.keyup(this.keyboard)
    }

    private startClickHold(e: MouseEvent) {
      this.clicktimeoutid = setTimeout(() => this.onClickHeld(e), 500)
    }
    private stopClickHold() {
      clearTimeout(this.clicktimeoutid)
    }

    private onClicked(e: MouseEvent) {
      e.preventDefault()
      this.clicked(this.mouse)
    }

    private onClickHeld(e: MouseEvent) {
      e.preventDefault()
      this.heldDown(this.mouse)
    }

    private onDoubleClicked(e: MouseEvent) {
      e.preventDefault()
      this.doubleClicked(this.mouse)
    }

    private formElementBinding() {
      let propToBind = this.element.getAttribute('hp-model')
      if (propToBind && component.isFormItem(this.element)) {
        let [arg1, arg2] = propToBind.split('.')
        this.element.addEventListener('input', () => {
          if (propToBind && component.isFormItem(this.element)) {
            if (arg1 && !arg2) {
              this.scope[arg1] = this.element.value
            } else if (arg1 == 'root' && arg2) {
              this.rootScope[arg2] = this.element.value
            }
          }
        })
      }
    }

    public static isFormItem(el: any): el is HTMLInputElement | HTMLButtonElement | HTMLTextAreaElement | HTMLSelectElement {
      return el instanceof HTMLInputElement ||
        el instanceof HTMLButtonElement ||
        el instanceof HTMLSelectElement ||
        el instanceof HTMLTextAreaElement
    }

    // Overwriteable methods
    static tick(): any { }

    public addComponent<T extends element>(comp: componentType<T>): T {
      return component.createNewComponent(this.element, comp)
    }

    public removeComponent<T extends element>(comp: componentType<T>) {
      let idx = component.components.findIndex(c => c.element == this.element && c instanceof comp)
      idx > -1 && component.components.splice(idx, 1)
      component.removeEmptyComponents()
    }

    public removeComponents<T extends element>(comp: componentType<T>) {
      let items = component.components.filter(c => c.element == this.element && c instanceof comp)
      let i = items.length
      while (i) {
        let item = items[i--]
        let idx = component.components.indexOf(item)
        idx > -1 && component.components.splice(idx, 1)
      }
      component.removeEmptyComponents()
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

    public findChildComponent<T extends element>(comp: componentType<T>, callback?: (comp: T) => void): T | undefined {
      let elements = Array.from(this.element.querySelectorAll('*'))
      for (let i = 0; i < elements.length; i++) {
        let c = component.components.find(c => c instanceof comp && c.element == elements[i]) as T
        if (c) {
          c instanceof component && typeof callback == 'function' && callback(c)
          return c
        }
      }
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

    public findChildElement(selector: string, callback?: (comp: element) => void): element | undefined {
      let el = this.element.querySelector(selector) as HTMLElement
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

    public findChildElements(selector: string, callback?: (comp: element) => void): element[] {
      let elements = Array.from(this.element.querySelectorAll(selector)) as HTMLElement[]
      let comps: element[] = []
      elements.forEach(el => {
        let comp = component.components.find(c => c.element == el)
        if (!comp) {
          comp = component.createNewComponent(el, element)
        }
        comp instanceof element && comps.push(comp)
        typeof callback == 'function' && comp instanceof element && callback(comp)
      })
      return comps
    }

    public childElements(callback?: (comp: element) => void): element[] {
      let elements = Array.from(this.element.children) as HTMLElement[]
      let comps: element[] = []
      elements.forEach(el => {
        let comp = component.components.find(c => c.element == el)
        if (!comp) {
          comp = component.createNewComponent(el, element)
        }
        comp instanceof element && comps.push(comp)
        typeof callback == 'function' && comp instanceof element && callback(comp)
      })
      return comps
    }

    public broadcast(method: string, ...args: any[]) {
      component.components
        .filter(c => c.element == this.element)
        .forEach((comp: any) => typeof comp[method] == 'function' && comp[method](...args))
    }

    public broadcastTo<T extends element>(comp: componentType<T> | string | HTMLElement | Document | Window, method: string, ...args: any[]) {
      if (typeof comp == 'string') {
        Array.from(document.querySelectorAll(comp)).forEach(el => {
          component.components.filter(c => c.element == el).forEach((c: any) => typeof c[method] == 'function' && c[method](...args))
        })
      } else if (comp instanceof HTMLElement || comp instanceof Document || comp instanceof Window) {
        component.components.filter(c => c.node == comp).forEach((c: any) => typeof c[method] == 'function' && c[method](...args))
      } else {
        component.components.filter(c => c instanceof comp).forEach((c: any) => typeof c[method] == 'function' && c[method](...args))
      }
    }

    public broadcastAll(method: string, ...args: any[]) {
      component.components.forEach((comp: any) => typeof comp[method] == 'function' && comp[method](...args))
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
    // public parent(callback?: (components: component[]) => void): component[] {
    //   let components = component.components.filter(c => c.element == this.element.parentElement)
    //   typeof callback == 'function' && callback(components)
    //   return components
    // }

    public childComponent<T extends element>(comp: componentType<T>, callback?: (item: T) => void): T | null {
      let items = Array.from(this.element.querySelectorAll('*'))
      let c = component.components.find(c => c instanceof comp && items.indexOf(c.element) > -1) as T
      c && typeof callback == 'function' && callback(c)
      return c
    }

    public childComponents<T extends element>(comp: componentType<T>, callback?: (item: T) => void): T[] {
      let items = Array.from(this.element.querySelectorAll<HTMLElement>('*'))
      let comps = component.components.filter(c => c instanceof comp && items.indexOf(c.element) > -1) as T[]
      typeof callback == 'function' && comps.forEach(c => callback(c))
      return comps
    }

    public siblingElement<T extends element>(selector: string, callback?: (item: T) => void): T | null {
      let parent = this.element.parentElement
      if (!parent) return null
      let sibling = parent.querySelector(':scope > ' + selector) as HTMLElement
      if (!sibling) return null
      let comp = component.components.find(c => c.element == sibling) as T
      if (!comp) {
        comp = component.createNewComponent(sibling, element) as T
      }
      typeof callback == 'function' && callback(comp)
      return comp
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
    public static removeEmptyComponents() {
      let i = component.components.length
      while (i--) {
        let comp = component.components[i]
        if (!comp.element) {
          component.components.splice(i, 1)
        }
      }
    }

    /**
     * Destroys the current element
     *
     * @memberof element
     */
    public destroy(): void
    /**
     * Destorys the current element after a delay in seconds
     *
     * @param {number} delay
     * @memberof component
     */
    public destroy(delay: number): void
    /**
     * Destroys a particular element or component
     *
     * @param {(HTMLElement | component)} [item]
     * @memberof element
     */
    public destroy(item: HTMLElement | component): void
    /**
     * Destroys a particular element or component after a delay in seconds
     *
     * @param {(HTMLElement | component)} item
     * @param {number} delay
     * @memberof component
     */
    public destroy(item: HTMLElement | component, delay: number): void
    public destroy(...args: any[]): void {
      let item: HTMLElement | component = this.element
      let delay: number = 0
      // Set the element
      if (args[0] instanceof HTMLElement) item = args[0]
      else if (args[0] instanceof component) item = args[0]
      // Set the delay
      if (typeof args[0] == 'number') delay = args[0]
      else if (args[1] && typeof args[1] == 'number') delay = args[1]
      // Finally destroy the item
      if (delay > 0) {
        setTimeout(() => component._destroy(item), delay * 1000)
      } else {
        component._destroy(item)
      }
    }

    public static destory(item: HTMLElement | component, delay: number = 0) {
      if (delay > 0) {
        setTimeout(() => component._destroy(item), delay * 1000)
      } else {
        component._destroy(item)
      }
    }

    private static _destroy(item: HTMLElement | component) {
      if (item instanceof HTMLElement) {
        // Detatch elements from the components in the children
        Array.from(item.querySelectorAll('*')).forEach(el => {
          component.components.forEach((c: any) => {
            el.remove()
            c.element == el && (c['_element'] = null)
          })
        })
        // Detach elements from the components in the current item
        item.remove()
        component.components.forEach((c: any) => c.element == item && (c['_element'] = null))
      } else if (item instanceof component) {
        let idx = component.components.indexOf(item)
        idx > -1 && component.components.splice(idx, 1)
      }
      // Remove all components that don't have an element associated with them
      component.removeEmptyComponents()
    }

    public static createNewComponent<T extends element>(element: HTMLElement | Document | Window, comp: componentType<T>, mutation?: MutationRecord): T {
      let c = new comp(element)
      typeof c.created == 'function' && c.created(mutation)
      c.hasCreated = true
      let newval: any = null
      element instanceof HTMLElement && mutation && mutation.attributeName && (newval = element.getAttribute(mutation.attributeName))
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
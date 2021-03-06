namespace hp {

  export class element extends component {

    public get childCount(): number { return this.element.childNodes.length }
    public get id(): string { return this.element.id }
    public set id(value: string) { this.element.id = value }

    public get text(): string { return this.element.textContent || '' }
    public set text(value: string) { this.element.textContent = value || '' }

    public constructor(node?: hpElement) {
      super(node)
    }

    /**
     * Finds a child element of the document
     *
     * @param {string} selector
     * @returns
     * @memberof element
     */
    public find(selector: string, callback?: (item: element) => void) {
      let item = document.querySelector(selector) as HTMLElement
      typeof callback == 'function' && item && callback(getOrCreateComponent(item, element))
      return item
    }

    /**
     * Finds a child element of the current element
     *
     * @param {string} selector
     * @returns
     * @memberof element
     */
    public findFromParent(selector: string, callback?: (item: element) => void) {
      let parent = this.element.parentElement
      let item = undefined
      if (parent) {
        item = parent.querySelector(selector) as HTMLElement
        typeof callback == 'function' && item && callback(getOrCreateComponent(item, element))
      }
      return item
    }

    public findChildElement(selector: string, callback?: (comp: element) => void): element | undefined {
      let el = this.element.querySelector(selector) as HTMLElement
      let comp: element | undefined
      if (el) {
        let comp = getOrCreateComponent(el, element)
        typeof callback == 'function' && comp instanceof element && callback(comp)
      }
      return comp as element
    }

    public findElements(selector: string, callback?: (comp: element) => void): element[] {
      let elements: HTMLElement[] = Array.from(document.querySelectorAll(selector))
      let comps: element[] = []
      elements.forEach(el => {
        if (el) {
          let comp = getOrCreateComponent(el, element)
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
        let comp = getOrCreateComponent(el, element)
        comp instanceof element && comps.push(comp)
        typeof callback == 'function' && comp instanceof element && callback(comp)
      })
      return comps
    }

    public childElements(callback?: (comp: element) => void): element[] {
      let elements = Array.from(this.element.children) as HTMLElement[]
      let comps: element[] = []
      elements.forEach(el => {
        let comp = getOrCreateComponent(el, element)
        comps.push(comp)
        typeof callback == 'function' && callback(comp)
      })
      return comps
    }

    public parentElement(callback?: (comp: element) => void): element | undefined {
      let parent = this.element.parentElement
      let comp: element | undefined
      if (parent) {
        comp = getOrCreateComponent(parent, element)
        comp && typeof callback == 'function' && callback(comp)
      }
      return comp
    }

    public findElement(selector: string, callback?: (comp: element) => void): element | undefined {
      let el = document.querySelector(selector) as HTMLElement
      let comp: element | undefined
      if (el) {
        comp = getOrCreateComponent(el, element)
        comp && typeof callback == 'function' && callback(comp)
      }
      return comp as element
    }

    public upstream(selector: string, callback?: (comp: element) => void) {
      this._upstreamSelector(selector, this.element, callback)
    }

    private _upstreamSelector(selector: string, target?: Element, callback?: (comp: element) => void) {
      let parent = target ? target.parentElement : this.element.parentElement
      if (parent) {
        Array.from(parent.querySelectorAll(`:scope > ${selector}`)).forEach(item => {
          component.components.forEach(comp => {
            if (comp.element == item) {
              typeof callback == 'function' && callback(comp as element)
            }
          })
        })
        this._upstreamSelector(selector, parent, callback)
      }
    }

    /**
     * Finds the closest element
     *
     * @param {string} selector
     * @param {(item: HTMLElement) => void} callback
     * @returns
     * @memberof element
     */
    public closest(selector: string, callback?: (item: element) => void) {
      let item = this.element.closest(selector) as HTMLElement
      item && typeof callback == 'function' && callback(getOrCreateComponent(item, element))
      return item
    }

    /**
     * Tests if the current element matches the selector
     *
     * @param {string} selector
     * @returns
     * @memberof element
     */
    public isTarget(selector: string) {
      return this.element.matches(selector)
    }

    /**
     * Sets the elements attribute value
     *
     * @param {string} key
     * @param {*} value
     * @memberof element
     */
    public setAttribute(key: string, value: any) {
      this.element.setAttribute(key, value)
    }

    /**
     * Gets the elements attribute value
     *
     * @param {string} key
     * @param {*} [fallback]
     * @returns {*}
     * @memberof element
     */
    public getAttribute(key: string, fallback: any = ''): any {
      return this.element.getAttribute(key) || fallback
    }

    /**
     * Sets the elements text content
     *
     * @param {*} value
     * @returns
     * @memberof element
     */
    public textContent(value: any) {
      this.element.textContent = value.toString()
      return this
    }

    /**
     * Sets the elements html content
     *
     * @param {*} value
     * @memberof element
     */
    public html(value: any) {
      if (value instanceof HTMLElement) {
        this.element.innerHTML = value.outerHTML
      } else if (typeof value == 'string') {
        this.element.innerHTML = value
      } else {
        this.element.innerHTML = value.toString()
      }
    }

    /**
     * Sets one style on the element
     *
     * @param {string} key
     * @param {*} value
     * @returns {this}
     * @memberof element
     */
    public css(key: string, value: string | number): this
    /**
     * Sets multiple styles on the element
     *
     * @param {object} items
     * @returns {this}
     * @memberof element
     */
    public css(items: object): this
    public css(...args: any[]) {
      if (typeof args[0] == 'object') {
        for (let key in args[0]) { (<any>this.element.style)[key] = args[0][key] }
      } else {
        this.element.style[args[0]] = args[1]
      }
      return this
    }

    /**
     * Gets an attribute as an integer
     *
     * @param {string} key
     * @param {number} [fallback=0]
     * @returns
     * @memberof element
     */
    public getInt(key: string, fallback: number = 0): number {
      return parseInt(this.getAttribute(key, fallback))
    }

    /**
     * Gets an attribute as a float
     *
     * @param {string} key
     * @param {number} [fallback=0]
     * @returns
     * @memberof element
     */
    public getFloat(key: string, fallback: number = 0): number {
      return parseFloat(this.getAttribute(key, fallback))
    }

    /**
     * Gets an attribute as a boolean
     *
     * @param {string} key
     * @param {boolean} [fallback=false]
     * @returns
     * @memberof element
     */
    public getBoolean(key: string, fallback: boolean = false): boolean {
      let val = this.getAttribute(key, fallback) || false
      return val > 0 || val == 'true' || false
    }

    /**
     * Gets an attribute as json data
     *
     * @param {string} key
     * @param {Object} [fallback={}]
     * @returns
     * @memberof element
     */
    public getJson(key: string, fallback: Object = {}) {
      let val = this.getAttribute(key) || '{}'
      try {
        return JSON.parse(val)
      } catch (e) {
        return fallback
      }
    }

    /**
     * Toggles an attribute then gets its new value
     *
     * @param {string} key
     * @returns {boolean}
     * @memberof element
     */
    public toggle(key: string): boolean {
      this.setAttribute(key, this.getBoolean(key, false) ? 'false' : 'true')
      return this.getBoolean(key)
    }

    /**
     * Inserts html
     *
     * @template T
     * @param {InsertPosition} position
     * @param {(string | HTMLElement | component | componentType<T>)} html
     * @returns
     * @memberof element
     */
    public insert<T extends element>(position: InsertPosition, html: string | HTMLElement | component | componentType<T>) {
      if (html instanceof HTMLElement) {
        return this.element.insertAdjacentElement(position, html)
      } else if (html instanceof component) {
        return this.element.insertAdjacentElement(position, html.element)
      } else if (typeof html == 'string') {
        return this.element.insertAdjacentHTML(position, html)
      } else {
        let ele = new html()
        this.element.insertAdjacentElement(position, ele.element)
      }
    }

    /**
     * Adds a child element at the end
     *
     * @template T
     * @param {(string | HTMLElement | component | componentType<T>)} element
     * @param {string} [content]
     * @returns
     * @memberof element
     */
    public append<T extends element>(element: string | HTMLElement | component | componentType<T>, content?: string) {
      // public append<T extends element>(html: string | HTMLElement | component | componentType<T>) {
      if (typeof element == 'string') element = this.makeElement(element, content)
      return this.insert('beforeend', element)
    }

    /**
     * Adds a child element to the beginning
     *
     * @template T
     * @param {(string | HTMLElement | component | componentType<T>)} element
     * @param {string} [content]
     * @returns
     * @memberof element
     */
    public prepend<T extends element>(element: string | HTMLElement | component | componentType<T>, content?: string) {
      if (typeof element == 'string') element = this.makeElement(element, content)
      return this.insert('afterbegin', element)
    }

    /**
     * Adds a child element before the element
     *
     * @template T
     * @param {(string | HTMLElement | component | componentType<T>)} element
     * @param {string} [content]
     * @returns
     * @memberof element
     */
    public before<T extends element>(element: string | HTMLElement | component | componentType<T>, content?: string) {
      if (typeof element == 'string') element = this.makeElement(element, content)
      return this.insert('beforebegin', element)
    }

    /**
     * Adds a child element after the element
     *
     * @template T
     * @param {(string | HTMLElement | component | componentType<T>)} element
     * @param {string} [content]
     * @returns
     * @memberof element
     */
    public after<T extends element>(element: string | HTMLElement | component | componentType<T>, content?: string) {
      if (typeof element == 'string') element = this.makeElement(element, content)
      return this.insert('afterend', element)
    }

    /**
     * Appends an emmet styled element at the end of the element
     * #money.pit --> <div id="money" class="pit"></div>
     *
     * @template T
     * @param {string} element
     * @param {string} [content]
     * @returns {T}
     * @memberof element
     */
    public appendElement<T extends HTMLElement>(element: string, content?: string, asText: boolean = false): element {
      let el = this.makeElement<T>(element, content, asText)
      this.append(el)
      return createNewComponent(el, hp.element)
    }

    /**
     * Prepends an emmet styled element at the beginning of the element
     * #money.pit --> <div id="money" class="pit"></div>
     *
     * @template T
     * @param {string} element
     * @param {string} [content]
     * @returns {T}
     * @memberof element
     */
    public prependElement<T extends HTMLElement>(element: string, content?: string, asText: boolean = false): T {
      let el = this.makeElement<T>(element, content, asText)
      this.prepend(el)
      return el
    }

    /**
     * Inserts an emmet styled element before the element
     * #money.pit --> <div id="money" class="pit"></div>
     *
     * @template T
     * @param {string} element
     * @param {string} [content]
     * @returns {T}
     * @memberof element
     */
    public beforeElement<T extends HTMLElement>(element: string, content?: string, asText: boolean = false): T {
      let el = this.makeElement<T>(element, content, asText)
      this.before(el)
      return el
    }

    /**
     * Inserts an emmet styled element after the element
     * #money.pit --> <div id="money" class="pit"></div>
     *
     * @template T
     * @param {string} element
     * @param {string} [content]
     * @returns {T}
     * @memberof element
     */
    public afterElement<T extends HTMLElement>(element: string, content?: string, asText: boolean = false): T {
      let el = this.makeElement<T>(element, content, asText)
      this.after(el)
      return el
    }

    /**
     * Makes an element
     * #money.pit --> <div id="money" class="pit"></div>
     *
     * @template T
     * @param {string} element
     * @param {string} [content]
     * @returns {T}
     * @memberof element
     */
    public makeElement<T extends HTMLElement>(element: string, content?: string, asText: boolean = true): T {
      let info = hp.element.parseQuerySelector(element)
      let el = document.createElement(info.element)
      info.id.length > 0 && (el.id = info.id)
      info.classList.length > 0 && el.classList.add(...info.classList)
      info.attributes.forEach(a => a.key ? el.setAttribute(a.key, a.value) : el.setAttribute(a.value, a.value))
      info.properties.forEach(p => el.setAttribute(p, p))
      if (asText) {
        el.textContent = typeof content !== 'undefined' ? content : ''
      } else {
        el.innerHTML = typeof content !== 'undefined' ? content : ''
      }
      return el as T
    }

    /**
     * Removes child elements from the beginning or the end of the element
     * if the number of children has reached the max child amount
     *
     * @param {number} maxItems
     * @param {('beginning' | 'end')} [side='end']
     * @memberof element
     */
    public maxChildren(maxItems: number, side: 'beginning' | 'end' = 'end') {
      this.childCount > maxItems && side.toLowerCase() == 'beginning' ?
        this.removeFirst(this.childCount - maxItems) :
        this.removeLast(this.childCount - maxItems)
    }

    /**
     * Removes 'x' number of child elements from the beginning of the element
     *
     * @param {number} [amountToRemove=1]
     * @memberof element
     */
    public removeFirst(amountToRemove = 1) {
      for (let i = 0; i < amountToRemove; i++) {
        let element = this.element.children.item(0) as HTMLElement
        element && this.destroy(element)
      }
    }

    /**
     * Removes the nth child element
     *
     * @param {number} index
     * @memberof element
     */
    public removeAt(index: number) {
      let element = this.element.children.item(index) as HTMLElement
      element && this.destroy(element)
    }

    /**
     * Removes the 'x' number of child elments form the end of the element
     *
     * @param {number} [amountToRemove=1]
     * @memberof element
     */
    public removeLast(amountToRemove = 1) {
      for (let i = 0; i < amountToRemove; i++) {
        let element = this.element.children.item(this.element.children.length - 1) as HTMLElement
        element && this.destroy(element)
      }
    }

    /**
     * Adds a class to the element
     *
     * @param {...string[]} classList
     * @memberof element
     */
    public addClass(...classList: string[]) {
      this.element.classList.add(...classList)
    }

    /**
     * Removes a class from the element
     *
     * @param {...string[]} classList
     * @memberof element
     */
    public removeClass(...classList: string[]) {
      this.element.classList.remove(...classList)
    }

    /**
     * Toggles a class on the element
     *
     * @param {...string[]} classList
     * @memberof element
     */
    public toggleClass(...classList: string[]) {
      classList.forEach(c => this.element.classList.toggle(c))
    }

    /**
     * Checks if one of the classes exist on the element
     *
     * @param {...string[]} classList
     * @returns
     * @memberof element
     */
    public hasClass(...classList: string[]) {
      return Array.from(this.element.classList).filter(c => classList.indexOf(c) > -1).length > 0
    }

    /**
     * Checks if all classes exist on the element
     *
     * @param {...string[]} classList
     * @returns
     * @memberof element
     */
    public hasClasses(...classList: string[]) {
      return Array.from(this.element.classList).filter(c => classList.indexOf(c) > -1).length == classList.length
    }

    /**
     * Enables/Diables classes based on a boolean
     *
     * @param {boolean} enable
     * @param {...string[]} classList
     * @memberof element
     */
    public enableClass(enable: boolean, ...classList: string[]) {
      enable ? this.addClass(...classList) : this.removeClass(...classList)
    }

    /**
     * Takes a query selector and returns information about the selector
     *
     * @param {string} selector
     * @returns
     * @memberof element
     */
    public static parseQuerySelector(selector: string) {
      let obj: { classList: string[], id: string, element: string, properties: string[], attributes: { key: string, value: string }[] } = {
        classList: [],
        id: '',
        element: 'div',
        attributes: [],
        properties: []
      }
      obj.classList = (selector.match(/\.[a-z-_0-9]+/g) || []).map(v => v.replace('.', ''))
      obj.element = selector.toLowerCase().split(/[^a-z0-9]/, 2)[0] || 'div'
      obj.attributes = (selector.match(/\[.+?\]/g) || []).reduce<{ key: string, value: string }[]>((r, v) => {
        let [key, value] = v.split('=')
        key = !key ? '' : key
        value = !value ? '' : value
        return r.concat({
          key: key.replace(/^\[|\]$/g, ''),
          value:
            // Remove the brackets
            value.replace(/\]$/g, '')
              // Remove the first quote or apostrophe at the beginning of the string only
              .replace(/^('|")/, '')
              // Remove the last quote or apostrophe at the end of the string only
              .replace(/('|")$/, '')
        })
      }, [])
      obj.properties = (selector.match(/:\D+/g) || []).reduce<string[]>((r, v) => r.concat(v.replace(/^:/, '')), [])
      return obj
    }
  }
}
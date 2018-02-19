namespace hp {

  export class element extends component {

    public get childCount(): number { return this.element.childNodes.length }
    public get id(): string { return this.element.id }

    public get width(): number { return this.element.clientWidth }
    public get scrollWidth(): number { return this.element.scrollWidth }
    public get height(): number { return this.element.clientHeight }
    public get scrollHeight(): number { return this.element.scrollHeight }

    public constructor(node?: HTMLElement | Document | Window) {
      super(node)
    }

    /**
     * Finds an element
     *
     * @param {string} selector
     * @returns
     * @memberof element
     */
    public find(selector: string) {
      return this.element.querySelector(selector)
    }

    /**
     * Finds the closest element
     *
     * @param {string} selector
     * @param {(item: HTMLElement) => void} callback
     * @returns
     * @memberof element
     */
    public closest(selector: string, callback: (item: HTMLElement) => void) {
      let item = this.element.closest(selector) as HTMLElement
      if (item && typeof callback == 'function') {
        callback(item)
      }
      return item
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
    public getAttribute(key: string, fallback?: any): any {
      return this.element.getAttribute(key)
    }

    /**
     * Sets the attributes content
     *
     * @param {*} value
     * @returns
     * @memberof element
     */
    public textContent(value: any) {
      this.element.textContent = value
      return this
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
     * @param {(string | HTMLElement | component | componentType<T>)} html
     * @returns
     * @memberof element
     */
    public append<T extends element>(html: string | HTMLElement | component | componentType<T>) {
      return this.insert('beforeend', html)
    }

    /**
     * Adds a child element to the beginning
     *
     * @template T
     * @param {(string | HTMLElement | component | componentType<T>)} html
     * @returns
     * @memberof element
     */
    public prepend<T extends element>(html: string | HTMLElement | component | componentType<T>) {
      return this.insert('afterbegin', html)
    }

    /**
     * Adds a child element before the element
     *
     * @template T
     * @param {(string | HTMLElement | component | componentType<T>)} html
     * @returns
     * @memberof element
     */
    public before<T extends element>(html: string | HTMLElement | component | componentType<T>) {
      return this.insert('beforebegin', html)
    }

    /**
     * Adds a child element after the element
     *
     * @template T
     * @param {(string | HTMLElement | component | componentType<T>)} html
     * @returns
     * @memberof element
     */
    public after<T extends element>(html: string | HTMLElement | component | componentType<T>) {
      return this.insert('afterend', html)
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
    public appendElement<T extends HTMLElement>(element: string, content?: string, asText: boolean = false): T {
      let el = this.makeElement<T>(element, content, asText)
      this.append(el)
      return el
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
      let info = this.parseQuerySelector(element)
      let el = document.createElement(info.element)
      info.id.length > 0 && (el.id = info.id)
      info.classList.length > 0 && el.classList.add(...info.classList)
      info.attributes.forEach(a => a.key ? el.setAttribute(a.key, a.value) : el.setAttribute(a.value, a.value))
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
        element && this.removeElement(element)
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
      element && this.removeElement(element)
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
        element && this.removeElement(element)
      }
    }

    /**
     * Removes the current element
     *
     * @memberof element
     */
    public removeElement(): void
    /**
     * Removes a particular element
     *
     * @param {(HTMLElement | component)} [element]
     * @memberof element
     */
    public removeElement(element?: HTMLElement | component): void
    public removeElement(element?: HTMLElement | component): void {
      let el: HTMLElement
      if (!element) { el = this.element }
      else { el = element instanceof HTMLElement ? element : element.element }
      el && el.remove()
      el && component.components.forEach((c: any) => c.element == el && (c['_element'] = null))
      this.removeEmptyComponents()
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
    public parseQuerySelector(selector: string) {
      let obj: { classList: string[], id: string, element: string, attributes: { key: string, value: string }[] } = {
        classList: [],
        id: '',
        element: 'div',
        attributes: []
      }
      obj.classList = (selector.match(/\.[a-z-_0-9]+/g) || []).map(v => v.replace('.', ''))
      obj.element = selector.toLowerCase().split(/[^a-z]/, 2)[0] || 'div'
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
      return obj
    }
  }
}
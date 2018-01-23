namespace hp {

  export interface element {
    clicked(button: number): void
    doubleClicked(button: number): void
  }

  export abstract class element extends component {

    public get childCount(): number { return this.element.childNodes.length }

    public constructor(element?: HTMLElement) {
      super(element)
      if (typeof this.clicked == 'function') {
        this.element.addEventListener('click', this.onClicked.bind(this))
      }
      if (typeof this.doubleClicked == 'function') {
        this.element.addEventListener('dblclick', this.onDoubleClicked.bind(this))
      }
    }

    private onClicked(e: MouseEvent) {
      e.preventDefault()
      this.clicked(e.button)
    }

    private onDoubleClicked(e: MouseEvent) {
      e.preventDefault()
      this.doubleClicked(e.button)
    }

    public find(selector: string) {
      return this.element.querySelector(selector)
    }

    public closest(selector: string, callback: (item: HTMLElement) => void) {
      let item = this.element.closest(selector) as HTMLElement
      if (item && typeof callback == 'function') {
        callback(item)
      }
      return item
    }

    public setAttribute(key: string, value: any) {
      this.element.setAttribute(key, value)
    }

    public getAttribute(key: string, fallback?: any): any {
      return this.element.getAttribute(key)
    }

    public textContent(value: any) {
      this.element.textContent = value
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

    public insert<T extends component>(position: InsertPosition, html: string | HTMLElement | component | componentType<T>) {
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

    public append<T extends component>(html: string | HTMLElement | component | componentType<T>) {
      return this.insert('beforeend', html)
    }

    public prepend<T extends component>(html: string | HTMLElement | component | componentType<T>) {
      return this.insert('afterbegin', html)
    }

    public before<T extends component>(html: string | HTMLElement | component | componentType<T>) {
      return this.insert('beforebegin', html)
    }

    public after<T extends component>(html: string | HTMLElement | component | componentType<T>) {
      return this.insert('afterend', html)
    }

    public appendElement<T extends HTMLElement>(element: string, content?: string): T {
      let el = this.makeElement<T>(element, content)
      this.append(el)
      return el
    }

    public prependElement<T extends HTMLElement>(element: string, content?: string): T {
      let el = this.makeElement<T>(element, content)
      this.prepend(el)
      return el
    }

    public beforeElement<T extends HTMLElement>(element: string, content?: string): T {
      let el = this.makeElement<T>(element, content)
      this.before(el)
      return el
    }

    public afterElement<T extends HTMLElement>(element: string, content?: string): T {
      let el = this.makeElement<T>(element, content)
      this.after(el)
      return el
    }

    public makeElement<T extends HTMLElement>(element: string, content?: string): T {
      let info = this.parseQuerySelector(element)
      let el = document.createElement(info.element)
      info.id.length > 0 && (el.id = info.id)
      info.classList.length > 0 && el.classList.add(...info.classList)
      info.attributes.forEach(a => a.key ? el.setAttribute(a.key, a.value) : el.setAttribute(a.value, a.value))
      el.innerHTML = typeof content !== 'undefined' ? content : ''
      return el as T
    }

    public removeFirst() {
      let element = this.element.children.item(0) as HTMLElement
      element && this.removeElement(element)
    }

    public removeAt(index: number) {
      let element = this.element.children.item(index) as HTMLElement
      element && this.removeElement(element)
    }

    public removeLast() {
      let element = this.element.children.item(this.element.children.length - 1) as HTMLElement
      element && this.removeElement(element)
    }

    public removeElement(element?: HTMLElement | component) {
      let el: HTMLElement
      if (!element) { el = this.element }
      else { el = element instanceof HTMLElement ? element : element.element }
      el && el.remove()
      el && component.components.forEach((c: any) => c.element == el && (c.element = null))
      this.removeEmptyComponents()
    }

    private removeEmptyComponents() {
      let i = component.components.length
      while (i--) {
        let comp = component.components[i]
        // console.log(comp.element)
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

    public addClass(...classList: string[]) {
      this.element.classList.add(...classList)
    }

    public removeClass(...classList: string[]) {
      this.element.classList.remove(...classList)
    }

    public toggleClass(...classList: string[]) {
      classList.forEach(c => this.element.classList.toggle(c))
    }

    public enableClass(enable: boolean, ...classList: string[]) {
      enable ? this.addClass(...classList) : this.removeClass(...classList)
    }

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
namespace mutator {
  export abstract class dom {

    public readonly element: HTMLElement
    public get childCount(): number { return this.element.childNodes.length }

    public constructor(element?: HTMLElement) {
      this.element = !element ? document.createElement('div') : element
    }

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

    public insert<T extends component>(position: InsertPosition, html: string | HTMLElement | component | ComponentType<T>) {
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

    public append<T extends component>(html: string | HTMLElement | component | ComponentType<T>) {
      return this.insert('beforeend', html)
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

    public makeElement<T extends HTMLElement>(element: string, content?: string): T {
      let info = this.parseQuerySelector(element)
      let el = document.createElement(info.element)
      info.id.length > 0 && (el.id = info.id)
      info.classList.length > 0 && el.classList.add(...info.classList)
      info.attributes.forEach(a => a.key ? el.setAttribute(a.key, a.value) : el.setAttribute(a.value, a.value))
      el.innerHTML = content ? content : ''
      return el as T
    }

    public prepend<T extends component>(html: string | HTMLElement | component | ComponentType<T>) {
      return this.insert('afterbegin', html)
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

    public removeElement(element: HTMLElement | component) {
      let el = element instanceof HTMLElement ? element : element.element
      el && el.parentElement && el.parentElement.removeChild(el)
      el && el.parentElement && component.components.forEach((c: any) => c.element == el && (c.element = null))
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
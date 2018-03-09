namespace hp.core {
  document.addEventListener('DOMContentLoaded', e => {
    Array.from(document.querySelectorAll<Element>('[hp-for]')).forEach(el => {
      template.templates.push({
        element: el, parent: <Element>el.parentElement
      })
      el.remove()
    })
  })

  export interface templateElement {
    element: Element
    parent?: Element
    data?: any
  }

  export interface dataScope {
    name: string
    location: string[]
  }

  export class template {
    public static templates: templateElement[] = []

    public readonly template: templateElement
    private readonly comp: hp.template

    private readonly dataScope: dataScope[] = []

    private reEvaluateTemplate: boolean = true
    public set data(value: any) { this.template.data = value }
    public get data(): any { return this.template.data }
    public set html(value: string | Element) { this.template.element = template.toTemplate(value) }
    public get html(): string | Element { return this.template.element }

    public static add(tpl: string | Element, data?: any) {
      this.templates.push({ element: this.toTemplate(tpl), data })
    }

    public constructor(comp: hp.template, tpl: string | Element, parent?: Element, data?: any[] | Object, reEvaluateTemplate: boolean = true) {
      this.comp = comp
      this.template = {
        element: template.toTemplate(tpl),
        data: this.templateProxy(data),
        parent
      }
      this.reEvaluateTemplate = reEvaluateTemplate
    }

    private getLocation(key: string) {
      let val = this.dataScope.find(i => i.name == key)
      return val ? val.location : []
    }

    private get last() {
      return this.dataScope[this.dataScope.length - 1]
    }

    public toString() {
      if (!this.template) return ''
      let clone = this.template.element.cloneNode(true) as Element
      // this.process(clone, this.template.data, -1, '', '', '')
      this.process(clone, 0)
      clone.innerHTML = clone.innerHTML.replace(/\\{/g, '{').replace(/\\}/g, '}')
      return clone.innerHTML
    }

    public render() {
      if (!this.template || !this.template.parent) return false
      this.template.parent.innerHTML = this.toString()
      return true
    }

    private static toTemplate(tpl: string | Element) {
      let element = document.createElement('div')
      if (typeof tpl == 'string') {
        element.innerHTML = tpl
      } else {
        element.appendChild(tpl)
      }
      return element
    }

    public process(element: Element, index: string | number) {
      Array.from(element.children).forEach(child => {
        if (child.hasAttribute('hp-for') || child.hasAttribute('hp-for-else')) {
          this.runFor(child, element, index)
        } else {

        }

      })
    }

    // public process(element: Element, data: any, index: number | string, source: string, key: string, val: string) {
    //   // this.bindElement(element, data, index, source, key, val)
    //   Array.from(element.children).forEach(child => {
    //     let hasFor = child.hasAttribute('hp-for') || child.hasAttribute('hp-for-else')
    //     if (hasFor) {
    //       this.runFor(child, element, data)
    //       // this.runIf(child, element, data)
    //     } else {
    //       this.bindElement(child, data, index, source, key, val)
    //       this.process(child, data, index, source, key, val)
    //     }
    //   })
    // }

    private runFor(element: Element, parent: Element, index: string | number) {
      if (element.hasAttribute('hp-for')) {
        let elFor = element.getAttribute('hp-for') as string
        if (elFor.indexOf(' in ') > -1) {
          this._forObjectArray(element, parent, elFor, index)
          this.dataScope.pop()
        } else if (elFor.indexOf(' from ') > -1) {
          // this._forCount(element, parent, elFor)
        }
      }
      // else if (element.hasAttribute('hp-for-else')) {
      //   element.remove()
      //   let source = element.getAttribute('hp-for-else') || ''
      //   let newData = source == ':data' ? data : query(source, data)
      //   if (
      //     (Array.isArray(newData) && data.length == 0) ||
      //     (typeof newData == 'object' && Object.keys(newData).length == 0)
      //   ) {
      //     this._makeNode(element, parent, data, -1, source, '', '')
      //   }
      // }
    }

    // private _forCount(element: Element, parent: Element, elFor: string, data: any) {
    //   let [key, from, start, type, end, by, increment] = elFor.split(/ (from|to|through|by) /i).map(i => i.trim())
    //   let s = 0, e = 1, inc = 1
    //   s = parseFloat(start.match(/[a-zA-Z]+/) ? data[start] : start)
    //   e = parseFloat(end.match(/[a-zA-Z]+/) ? data[end] : end)
    //   inc = parseFloat(increment || '1')
    //   // Make sure 'from' and 'to' or 'through' are used and optionally 'by'
    //   if (by) by = by.toLowerCase()
    //   if (from.toLowerCase() != 'from' || ['by', undefined].indexOf(by) == -1 || ['to', 'through'].indexOf(type.toLowerCase()) == -1) return
    //   element.remove()
    //   // end is exclusive
    //   if (type == 'to') {
    //     if (e > s) {
    //       // Count up
    //       for (let i = s; i < e; i += inc) { this._makeNode(element, parent, data, i, '', key, '') }
    //     } else {
    //       // Count down
    //       for (let i = s; i > e; i -= inc) { this._makeNode(element, parent, data, i, '', key, '') }
    //     }
    //   }
    //   // end is inclusive
    //   else if (type == 'through') {
    //     if (e > s) {
    //       // Count up
    //       for (let i = s; i <= e; i += inc) { this._makeNode(element, parent, data, i, '', key, '') }
    //     } else {
    //       // Count down
    //       for (let i = s; i >= e; i -= inc) { this._makeNode(element, parent, data, i, '', key, '') }
    //     }
    //   }
    // }

    private _forObjectArray(element: Element, parent: Element, elFor: string, index: string | number) {
      let [value, source] = elFor.split(' in ').map(i => i.trim())
      let last = this.last || { name: '', location: [] }
      let lastLocation = last.location.join('.')
      let lastName = last.name || ''
      this.dataScope.push({ name: value, location: source.split('.') })
      let [arg1, arg2] = value.split(',')
      let key = arg1 && arg2 ? arg1 : ''
      let val = arg1 && !arg2 ? arg1 : arg2

      let s = source.split('.')
      s.shift()
      s.unshift(index.toString())
      if (lastLocation != ':data')
        s.unshift(lastLocation)
      let loc = s.join('.').replace(/^\.|\.$/g, '')
      // let loc = source == ':data' ? '' : lastLocation
      // console.log({ lastLocation, lastName, loc, source, index })
      // let newData = query(loc, this.data)
      let newData = source == ':data' ? this.data : query(loc, this.data)
      // console.log(newData)
      if (Array.isArray(newData)) {
        newData.forEach((data, index) => {
          this._makeNode(element, parent, index)
        })
      }

      // this.dataScope.push({ source, parent })
      // element.remove()
      // if (Array.isArray(newData)) {
      //   newData.forEach((data, index) => {
      //     this._makeNode(element, parent, data, index, source, key, val)
      //   })
      // } else if (typeof newData == 'object') {
      //   for (let index in newData) {
      //     this._makeNode(element, parent, data, index, source, key, val)
      //   }
      // }
    }

    private _makeNode(element: Element, parent: Element, index: string | number) {//, data: any, index: number | string, source: string, key: string, val: string) {
      let clone = element.cloneNode(true) as Element
      parent.appendChild(clone)
      // clone.removeAttribute('hp-for')
      // clone.removeAttribute('hp-for-else')
      // this.bindElement(clone, data, index, source, key, val)
      // this.bindElement(clone, data, index, source, key, val)
      this.bindElement(clone)
      this.process(clone, index)//, data, index, source, key, val)
    }

    // private runIf(element: Element, parent: Element, data: any) {
    //   if (element.hasAttribute('hp-if')) {
    //     let elIf = element.getAttribute('hp-if')
    //   }
    // }

    private bindElement(element: Element) {
      let inlineBindings = this.inlineBindings(element)
      if (inlineBindings.length > 0) {
        this.replaceInlineBindings(element, inlineBindings)//, data, index, inlineBindings, key)
      }
    }

    // private bindElement(element: Element, data: any, index: number | string, source: string, key: string, val: string) {
    //   let inlineBindings = this.inlineBindings(element)
    //   let rm = ''
    //   let selectorOrig = ''
    //   let selector: string[] = []
    //   let newSelector = ''
    //   if (element.hasAttribute('hp-bind') || element.hasAttribute('hp-bind-html')) {
    //     selectorOrig = element.getAttribute('hp-bind') || element.getAttribute('hp-bind-html') as string
    //     selector = selectorOrig.split('.')
    //     selector.length > 1 && (rm = selector.shift() || '')
    //     newSelector = selector.join('.')
    //     let value = selector.join('.') === key ? index : data[newSelector]
    //     value = typeof value == 'function' ? value() : value.toString()
    //     if (rm.length == 0 || (rm.length > 0 && rm == val)) {
    //       if (component.isFormItem(element)) {
    //         element.value = value
    //       } else {
    //         if (element.getAttribute('hp-bind-html')) {
    //           element.innerHTML = value
    //         } else {
    //           element.textContent = value
    //         }
    //       }
    //     }
    //   }
    //   if (inlineBindings.length > 0) {
    //     this.replaceInlineBindings(element, data, index, inlineBindings, key)
    //   }
    // }

    private inlineBindings(node: Element) {
      let bindings: string[] = []
      for (let i = 0; i < node.attributes.length; i++) {
        let attr = node.attributes[i]
        let matches = attr.value.match(/({{.+?}})/g)
        if (matches) bindings = bindings.concat(matches)
      }
      let n = node.cloneNode(true) as HTMLElement
      Array.from(n.children).forEach(child => child.remove())
      let matches = (n.textContent || '').match(/({{.+?}})/g)
      if (matches) bindings = bindings.concat(matches)
      return bindings
      // return []
    }

    private replaceInlineBindings(node: Element, bindings: string[]) {
      bindings.forEach(binding => {
        let regexp = new RegExp(escapeRegExp(binding), 'g')
        let selector = binding.replace(/{{|}}/g, '').split('.')
        // console.log(this.getLocation(selector[0]))
        // console.log('s', selector, JSON.stringify(this.dataScope))
        console.log(selector, this.getPath(selector).join('.'))
      })
    }

    private getPath(items: string[]) {
      let path: string[] = []
      let item = items.shift()
      if (item) {
        let loc = this.getLocation(item)
        if (loc.length > 0 && loc.join('.') != ':data') {
          path.push(...loc)
          this.getPath(loc)
        }
        path.push(...items)
      }
      return path
    }

    // private replaceInlineBindings(node: Element, data: any, index: any, bindings: string[], key: string) {
    //   bindings.forEach(binding => {
    //     let regexp = new RegExp(escapeRegExp(binding), 'g')
    //     let selector = binding.replace(/{{|}}/g, '').split('.')
    //     selector.length > 1 && selector.shift()
    //     let newSelector = selector.join('.')
    //     let value = newSelector === key ? index : data[newSelector]
    //     value = (Array.isArray(data) && newSelector === key ? data[value] : value) || ''
    //     let finalValue = (typeof value == 'function' ? value() : value.toString()) as string
    //     finalValue = finalValue.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    //     for (let i = 0; i < node.attributes.length; i++) {
    //       let attr = node.attributes[i]
    //       attr.value = attr.value.replace(regexp, finalValue)
    //     }
    //     node.innerHTML = node.innerHTML.replace(regexp, finalValue)
    //   })
    // }

    public revalidate() {
      if (!this.template.parent) return
      this.template.parent.innerHTML = ''
      typeof this.comp.preRender == 'function' && this.comp.preRender()
      let rendered = this.render()
      rendered && typeof this.comp.postRender == 'function' && this.comp.postRender()
    }

    private templateProxy(data: any) {
      if (data instanceof Object) {
        for (let key in data) {
          if (Array.isArray(data[key]) || data[key] instanceof Object) {
            data[key] = this.templateProxy(data[key])
          }
        }
      }
      return new Proxy(data, {
        set: (target, key, value) => {
          Reflect.set(target, key, value)
          if (this.reEvaluateTemplate) this.revalidate()
          return true
        },
        get: (target, key) => Reflect.get(target, key)
      })
    }
  }
}
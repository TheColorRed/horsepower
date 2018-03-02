namespace hp {
  export interface templateInfo {
    data?: any
    revalidate?: boolean
    template: string | Element
  }
  export interface template {
    preRender(): void
    postRender(): void
  }
  export abstract class template extends hp.element {
    abstract bind(): templateInfo

    protected template?: core.template
    protected revalidateTemplate: boolean = true

    public constructor(node: hpElement) {
      super(node)
      this.getTemplate(this.bind()).then(() => {
        this.revalidate()
      })
    }

    private revalidate() {
      this.element.innerHTML = ''
      typeof this.preRender == 'function' && this.preRender()
      let rendered = this.render()
      rendered && typeof this.postRender == 'function' && this.postRender()
    }

    private async getTemplate(tplInfo: templateInfo) {
      this.revalidateTemplate = tplInfo.revalidate ? tplInfo.revalidate : true
      let template = typeof tplInfo.template == 'string' ? await hp.ajax.get(tplInfo.template) : tplInfo.template
      let data = typeof tplInfo.template == 'string' ? await hp.ajax.get(tplInfo.data) : tplInfo.template
      this.template = new core.template(template, this.element, this.templateProxy(data))
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
          if (this.revalidateTemplate) this.revalidate()
          return true
        },
        get: (target, key) => Reflect.get(target, key)
      })
    }

    private render() {
      if (!this.template) return false
      let sourceData = this.template.template.data
      let element = this.template.template.element
      let clone = element.cloneNode(true) as Element
      let parent = this.template.template.parent as Element
      this.processNode(clone, sourceData)
      parent.innerHTML = clone.innerHTML
      return true
    }

    private processNode(element: Element, data: any, source?: string, key?: string, val?: string) {
      this.bindElement(element, data, source, key, val)
      Array.from(element.children).forEach(child => {
        let hasFor = child.hasAttribute('hp-for')
        // let hasBind = child.hasAttribute('hp-bind')
        this.bindElement(child, data, source, key, val)
        if (hasFor) {
          this.runFor(child, element, data)
        } else {
          this.processNode(child, data, source, key, val)
        }
      })
    }

    private runFor(element: Element, parent: Element, data: any) {
      if (element.hasAttribute('hp-for')) {
        let elfor = element.getAttribute('hp-for') as string
        let [value, source] = elfor.split('in').map(i => i.trim())
        let [arg1, arg2] = value.split(',')
        let key = arg1 && arg2 ? arg1 : ''
        let val = arg1 && !arg2 ? arg1 : arg2
        let reduce = this._reduce(source, data)
        Array.isArray(reduce) && reduce.forEach(item => {
          let clone = element.cloneNode(true) as Element
          // clone.removeAttribute('hp-for')
          element.remove()
          parent.appendChild(clone)
          this.processNode(clone, item, source, key, val)
        })
      }
    }

    private bindElement(element: Element, data: any, source?: string, key?: string, val?: string) {
      let inlineBindings = this.inlineBindings(element)
      let rm = ''
      let selectorOrig = ''
      let selector: string[] = []
      let newSelector = ''
      if (element.hasAttribute('hp-bind')) {
        selectorOrig = element.getAttribute('hp-bind') as string
        selector = selectorOrig.split('.')
        selector.length > 1 && (rm = selector.shift() || '')
        newSelector = selector.join('.')
        if (rm.length == 0 || (rm.length > 0 && rm == val)) {
          if (component.isFormItem(element)) {
            element.value = data[newSelector] || ''
          } else {
            element.innerHTML = data[newSelector] || ''
          }
        }
      }
      if (inlineBindings.length > 0) {
        this.replaceInlineBindings(element, data, inlineBindings)
      }
    }

    private inlineBindings(node: Element) {
      let bindings: string[] = []
      for (let i = 0; i < node.attributes.length; i++) {
        let attr = node.attributes[i]
        let matches = attr.value.match(/({{.+?}})/g)
        if (matches) bindings = bindings.concat(matches)
      }
      let matches = (node.textContent || '').match(/({{.+?}})/g)
      if (matches) bindings = bindings.concat(matches)
      return bindings
    }

    private replaceInlineBindings(node: Element, data: any, bindings: string[]) {
      bindings.forEach(binding => {
        for (let i = 0; i < node.attributes.length; i++) {
          let attr = node.attributes[i]
          let selector = binding.replace(/{{|}}/g, '').split('.')
          selector.shift()
          attr.value = attr.value.replace(new RegExp(escapeRegExp(binding), 'g'), data[selector.join('.')])
        }
      })
    }

    private _reduce(selector: string, obj: any) {
      return this._selectorParts(selector)
        .reduce((o, i) => o[i], obj)
    }

    protected _selectorParts(selector: string): string[] {
      let parts: string[] = []
      selector.trim().split('.').forEach(item => {
        item.split('[').filter(n => n && n.length > 0).forEach(item => {
          parts.push(item.replace(/\]/g, '').trim())
        })
      })
      return parts
    }
  }
}
namespace hp {
  export interface templateInfo {
    data?: any
    template: string | Element
  }
  export interface template {
    preRender(): void
    postRender(): void
  }
  export abstract class template extends hp.element {
    abstract bind(): templateInfo

    protected template?: core.template

    public constructor(node?: hpElement) {
      super(node)
      this.getTemplate(this.bind()).then(() => {
        typeof this.preRender == 'function' && this.preRender()
        let rendered = this.render()
        rendered && typeof this.postRender == 'function' && this.postRender()
      })
    }

    private async getTemplate(tplInfo: templateInfo) {
      let template = typeof tplInfo.template == 'string' ? await hp.ajax.get(tplInfo.template) : tplInfo.template
      let data = typeof tplInfo.template == 'string' ? await hp.ajax.get(tplInfo.data) : tplInfo.template
      this.template = new core.template(template, this.element, data)
    }

    private render() {
      if (!this.template) return false
      let sourceData = this.template.template.data
      let element = this.template.template.element
      let parent = this.template.template.parent as Element
      // console.log(element, sourceData)
      this.run(element, sourceData)
      parent.innerHTML = element.outerHTML
      // console.log(element)
      return true
    }

    private run(element: Element, data: any, source?: string, key?: string, val?: string) {
      let hasBind = element.hasAttribute('hp-bind')
      if (hasBind) {
        element = this.bindElement(element, data, source, key, val)
      } else {
        Array.from(element.children).forEach(c => this.run(c, data, source, key, val))
      }
      Array.from(element.children).forEach(child => {
        let hasFor = child.hasAttribute('hp-for')
        let hasBind = child.hasAttribute('hp-bind')
        if (hasFor) {
          this.runFor(child, element, data)
        } else if (hasBind) {
          // console.log(child)
          child = this.bindElement(child, data, source, key, val)
        } else {
          Array.from(child.children).forEach(c => {
            this.run(c, data)
          })
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
          let clone = element.cloneNode(true) as HTMLElement
          // clone.removeAttribute('hp-for')
          element.remove()
          parent.appendChild(clone)
          this.run(clone, item, source, key, val)
        })
      }
    }

    private bindElement(element: Element, data: any, source?: string, key?: string, val?: string) {
      if (element.hasAttribute('hp-bind')) {
        let rm = ''
        let selectorOrig = element.getAttribute('hp-bind') as string
        let selector = selectorOrig.split('.')
        selector.length > 1 && (rm = selector.shift() || '')
        let newSelector = selector.join('.')
        if (rm.length == 0 || (rm.length > 0 && rm == val)) {
          if (component.isFormItem(element)) {
            element.value = data[newSelector] || ''
          } else {
            element.innerHTML = data[newSelector] || ''
          }
          // console.log(selector.join('.'), element, value)
        }
      }
      return element
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
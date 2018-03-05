namespace hp {
  export interface templateInfo {
    data?: any
    dataUrl?: string
    template?: string | Element
    templateUrl?: string
    reEvaluate?: boolean
  }

  export interface template {
    preRender(): void
    postRender(): void
  }

  export abstract class template extends hp.element {
    abstract bind(): templateInfo

    protected tpl: core.template | any
    protected currentInfo: templateInfo = {
      // templateUrl: '',
      // dataUrl: ''
    }

    public get data(): any { return this.tpl.data }
    public set data(value: any) { this.tpl.data = value }
    public get template(): string | Element { return this.tpl.html }
    public set template(value: string | Element) { this.tpl.html = value }

    public constructor(node: hpElement) {
      super(node)
      this.reCouple(this.bind())
    }

    public reCouple(options: templateInfo) {
      // if (options.templateUrl === this.currentInfo.templateUrl) return
      // if (options.dataUrl === this.currentInfo.dataUrl) return
      this.currentInfo = options
      this.getTemplate(options).then(tpl => {
        this.tpl = tpl
        this.tpl instanceof core.template && this.tpl.revalidate()
      })
    }

    public setData(data: any) {
      if (!this.tpl) return
      this.tpl.data = data
    }

    public setTemplate(template: string | Element) {
      if (!this.tpl) return
      this.tpl.html = template
    }

    private async getTemplate(tplInfo: templateInfo) {
      let template: string | Element = '', data = {}

      // Should this template update when the html or data changes?
      let reEvaluateTemplate = typeof tplInfo.reEvaluate == 'boolean' ? tplInfo.reEvaluate : true

      // Setup the template
      if (typeof tplInfo.templateUrl == 'string') {
        template = await hp.ajax.get(tplInfo.templateUrl)
      } else if (typeof tplInfo.template == 'string' || tplInfo.template instanceof Element) {
        template = tplInfo.template
      }

      // Setup the data to bind to the template
      if (tplInfo.dataUrl) {
        data = await hp.ajax.get(tplInfo.dataUrl)
      } else if (tplInfo.data) {
        data = tplInfo.data
      }

      // Save the template info for this element
      return new core.template(this, template, this.element, data, reEvaluateTemplate)
    }
  }
}
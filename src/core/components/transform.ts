namespace hp {
  export class transform extends element {

    public get position(): vector {
      let info = this.info
      return new vector(info.left, info.top)
    }

    public get width(): number {
      return this.element.clientWidth
    }

    public get height(): number {
      return this.element.clientHeight
    }

    public get scrollWidth(): number {
      return this.element.scrollWidth
    }

    public get scrollHeight(): number {
      return this.element.scrollHeight
    }

    private get info() {
      let rect = this.element.getBoundingClientRect()
      return {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      }
    }
  }
}
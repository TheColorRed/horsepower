namespace hp {
  export class link extends element {
    public get href(): string { return this.element instanceof HTMLAnchorElement ? this.element.href : '' }
    public get path(): string {
      let link = document.createElement('a')
      link.href = this.href
      return link.pathname
    }
    public get host(): string {
      let link = document.createElement('a')
      link.href = this.href
      return link.host
    }
    public get hostname(): string {
      let link = document.createElement('a')
      link.href = this.href
      return link.hostname
    }
  }
}
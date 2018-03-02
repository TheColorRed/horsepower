namespace hp {
  export class link extends element {

    private _link?: HTMLAnchorElement

    public get href(): string { return this.element instanceof HTMLAnchorElement ? this.element.href : '' }
    public get path(): string {
      let link = document.createElement('a')
      link.href = this.href
      return link.pathname
    }

    public get host(): string {
      return this.link.host
    }

    public get hostname(): string {
      return this.link.hostname
    }

    public get hash(): string {
      return this.link.hash
    }

    // public getHashParam(key: string) {
    //   let hash = this.link.hash
    //   let params = hash.split('/')
    // }

    private get link() {
      if (this._link) return this._link
      this._link = document.createElement('a')
      this._link.href = this.href
      return this._link
    }

  }
}
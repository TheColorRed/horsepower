namespace hp {
  export class link extends element {
    public get href(): string { return this.element instanceof HTMLAnchorElement ? this.element.href : '' }
  }
}
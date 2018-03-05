namespace hp {

  export abstract class button extends formItem {

    public constructor(element?: Element) {
      super(element)
      if (typeof this.accepted == 'function') {
        if (this.element instanceof HTMLButtonElement ||
          (this.element instanceof HTMLInputElement && ['button', 'submit', 'reset'].indexOf(this.element.getAttribute('type') || '') != -1)) {
          this.node.addEventListener('click', this.onButtonAccept.bind(this))
        }
      } else if (typeof this.rejected == 'function') {
        if (this.element instanceof HTMLButtonElement ||
          (this.element instanceof HTMLInputElement && ['button', 'submit', 'reset'].indexOf(this.element.getAttribute('type') || '') != -1)) {
          this.node.addEventListener('click', this.onButtonReject.bind(this))
        }
      }
    }

    // public disabled(disabled: boolean) {
    //   if (this.element instanceof HTMLInputElement || this.element instanceof HTMLButtonElement) {
    //     this.element.disabled = disabled
    //   }
    // }

    private onButtonAccept(e: KeyboardEvent) {
      e.preventDefault()
      this.accepted((<any>this.element).value)
    }

    private onButtonReject(e: KeyboardEvent) {
      e.preventDefault()
      this.rejected((<any>this.element).value)
    }
  }
}
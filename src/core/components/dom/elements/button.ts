namespace mutator {

  export class button extends form {

    public constructor(element?: HTMLElement) {
      super(element)
      if (typeof this.accept == 'function') {
        if (this.element instanceof HTMLButtonElement ||
          (this.element instanceof HTMLInputElement && ['button', 'submit', 'reset'].indexOf(this.element.getAttribute('type') || '') != -1)) {
          this.element.addEventListener('click', this.onButtonAccept.bind(this))
        }
      } else if (typeof this.reject == 'function') {
        if (this.element instanceof HTMLButtonElement ||
          (this.element instanceof HTMLInputElement && ['button', 'submit', 'reset'].indexOf(this.element.getAttribute('type') || '') != -1)) {
          this.element.addEventListener('click', this.onButtonReject.bind(this))
        }
      }
    }

    private onButtonAccept(e: KeyboardEvent) {
      e.preventDefault()
      this.accept((<any>this.element).value)
    }

    private onButtonReject(e: KeyboardEvent) {
      e.preventDefault()
      this.reject((<any>this.element).value)
    }
  }
}
namespace mutator {

  export class input extends form {

    public constructor(element?: HTMLElement) {
      super(element)
      if (this.element instanceof HTMLInputElement) {
        this.element.addEventListener('keydown', this.onInputAccept.bind(this))
      }
      if (this.element instanceof HTMLInputElement) {
        this.element.addEventListener('keydown', this.onInputReject.bind(this))
      }
    }

    private onInputAccept(e: KeyboardEvent) {
      if (e.keyCode == 13) {
        e.preventDefault()
        this.accept((<any>this.element).value)
      }
    }

    private onInputReject(e: KeyboardEvent) {
      if (e.keyCode == 27) {
        e.preventDefault()
        this.reject((<any>this.element).value)
      }
    }
  }
}
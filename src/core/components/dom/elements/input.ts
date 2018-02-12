namespace hp {

  export interface input {
    input(value: string): void
    acceptKey: number | number[]
    rejectKey: number | number[]
  }

  export abstract class input extends form {

    private _lastValue: string = ''
    private _currentValue: string = ''

    protected shiftHeld: boolean = false
    protected ctrlHeld: boolean = false
    protected altHeld: boolean = false

    protected get lastValue(): string { return this._lastValue }
    protected get currentValue(): string { return this._currentValue }

    public constructor(element?: HTMLInputElement) {
      super(element)
      this.element.addEventListener('keydown', this.onKeyDown.bind(this))
      this.element.addEventListener('keyup', this.onKeyUp.bind(this))
      this.element.addEventListener('input', this.onInput.bind(this))
    }

    private onInput(e: KeyboardEvent) {
      e.preventDefault()
      let el = this.element as HTMLInputElement
      this._lastValue = this._currentValue
      this._currentValue = el.value
      if (typeof this.input == 'function') {
        this.input(e.key)
      }
    }

    private onKeyDown(e: KeyboardEvent) {
      this.altHeld = e.altKey
      this.shiftHeld = e.shiftKey
      this.ctrlHeld = e.ctrlKey
      if (typeof this.accept == 'function' && this.element instanceof HTMLInputElement) {
        let acceptKey = this.acceptKey || [13]
        acceptKey = !Array.isArray(acceptKey) ? [acceptKey] : acceptKey
        if (acceptKey.indexOf(e.keyCode) > -1) {
          e.preventDefault()
          this.accept(this.element.value)
        }
      }
      if (typeof this.reject == 'function' && this.element instanceof HTMLInputElement) {
        let rejectKey = this.rejectKey || [27]
        rejectKey = !Array.isArray(rejectKey) ? [rejectKey] : rejectKey
        if (rejectKey.indexOf(e.keyCode) > -1) {
          e.preventDefault()
          this.reject(this.element.value)
        }
      }
    }

    private onKeyUp(e: KeyboardEvent) {
      this.altHeld = e.altKey
      this.shiftHeld = e.shiftKey
      this.ctrlHeld = e.ctrlKey
    }
  }
}
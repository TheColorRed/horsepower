namespace hp {

  export interface input {
    input(value: keyboard): void
    acceptKey: number | number[]
    rejectKey: number | number[]
    inputDelay(value: keyboard): void
  }

  export abstract class input extends formItem {

    private _lastValue: string = ''
    private _currentValue: string = ''
    private _typeTimeOut: number = 0

    protected get lastValue(): string { return this._lastValue }
    protected get currentValue(): string { return this._currentValue }

    public constructor(element?: HTMLInputElement) {
      super(element)
      this.node.addEventListener('keydown', this.onInputKeyDown.bind(this))
      this.node.addEventListener('input', this.onInput.bind(this))
      if (typeof this.inputDelay == 'function') {
        this.element.addEventListener('keyup', this.startInputDelay.bind(this))
      }
    }

    private startInputDelay(e: KeyboardEvent) {
      clearTimeout(this._typeTimeOut)
      this._typeTimeOut = setTimeout(() => this.inputDelay(new keyboard(e)), 300)
    }

    private onInput(e: KeyboardEvent) {
      e.preventDefault()
      let el = this.element as HTMLInputElement
      this._lastValue = this._currentValue
      this._currentValue = el.value
      if (typeof this.input == 'function') {
        this.input(this.keyboard)
      }
    }

    private onInputKeyDown(e: KeyboardEvent) {
      if (typeof this.accepted == 'function' && this.element instanceof HTMLInputElement) {
        let acceptKey = this.acceptKey || [13]
        acceptKey = !Array.isArray(acceptKey) ? [acceptKey] : acceptKey
        if (acceptKey.indexOf(e.keyCode) > -1) {
          e.preventDefault()
          this.accepted(this.element.value)
        }
      }
      if (typeof this.rejected == 'function' && this.element instanceof HTMLInputElement) {
        let rejectKey = this.rejectKey || [27]
        rejectKey = !Array.isArray(rejectKey) ? [rejectKey] : rejectKey
        if (rejectKey.indexOf(e.keyCode) > -1) {
          e.preventDefault()
          this.rejected(this.element.value)
        }
      }
    }
  }
}
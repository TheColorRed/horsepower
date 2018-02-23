namespace hp {

  export interface checkbox {
    check(checked: boolean): void
  }

  export abstract class checkbox extends formItem {
    public get checked(): boolean {
      if (this.element instanceof HTMLInputElement && this.element.getAttribute('type') == 'checkbox') {
        return this.element.checked
      }
      return false
    }

    public constructor(element?: HTMLElement) {
      super(element)
      if (typeof this.check == 'function') {
        if (this.element instanceof HTMLInputElement && this.element.getAttribute('type') == 'checkbox') {
          this.node.addEventListener('click', this.onChecked.bind(this))
        }
      }
    }

    private onChecked(e: MouseEvent) {
      this.check((<any>this.element).checked)
    }
  }
}
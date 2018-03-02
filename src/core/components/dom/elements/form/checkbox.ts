namespace hp {

  export interface checkbox {
    toggled(checked: boolean): void
  }

  export abstract class checkbox extends formItem {
    public get checked(): boolean {
      if (this.element instanceof HTMLInputElement && this.element.getAttribute('type') == 'checkbox') {
        return this.element.checked
      }
      return false
    }

    public constructor(element?: HTMLInputElement) {
      super(element)
      if (typeof this.toggled == 'function') {
        if (this.element instanceof HTMLInputElement && this.element.getAttribute('type') == 'checkbox') {
          this.node.addEventListener('click', this.onChecked.bind(this))
        }
      }
    }

    private onChecked(e: MouseEvent) {
      this.toggled((<HTMLInputElement>this.element).checked)
    }
  }
}
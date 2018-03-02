namespace hp {

  export interface formItem {
    disabled(): void
    enabled(): void
  }

  export class formItem extends form {

    public get inactive() { return component.isFormItem(this.element) ? this.element.disabled : true }
    public set inactive(value: boolean) { component.isFormItem(this.element) && (this.element.disabled = value) }

    public constructor(node?: Element) {
      super(node)
    }

    public focus() {
      this.element.focus()
    }

    public disable(disabled: boolean) {
      if (component.isFormItem(this.element)) {
        this.element.disabled = disabled
      }
    }

  }
}
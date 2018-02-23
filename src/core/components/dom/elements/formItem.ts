namespace hp {
  export class formItem extends form {
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
namespace hp {

  export interface form {
    accept(value: string): void
    reject(value: string): void
  }

  export class form extends dom {

    public constructor(element?: HTMLElement) {
      super(element)
      if (this.element instanceof HTMLFormElement) {
        let submit = this.element.querySelector('input[type=submit]') as HTMLButtonElement
        submit && submit.addEventListener('click', this.onSubmit.bind(this))
      }
    }

    private async onSubmit(e: MouseEvent) {
      e.preventDefault()
      let response = await this.submit()
      if (typeof this.ajax == 'function') {
        this.ajax(response)
      }
    }

    public async submit() {
      let form = (this.element instanceof HTMLFormElement ? this.element : this.element.closest('form')) as HTMLFormElement
      if (form && form.classList.contains('ajax')) {
        return await ajax.submit(form)
      }
      return form.submit()
    }

    public reset() {
      let form = this.element.closest('form') as HTMLFormElement
      form && form.reset()
    }

    public value(val?: any) {
      if (this.element instanceof HTMLInputElement || this.element instanceof HTMLTextAreaElement) {
        if (typeof val === 'undefined') return this.element.value
        this.element.value = val
      }
    }
  }
}
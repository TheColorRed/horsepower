namespace hp {
  document.addEventListener('DOMContentLoaded', e => {
    Array.from(document.querySelectorAll<HTMLElement>('[hp-for]')).forEach(el => {
      template.templates.push({
        element: el, parent: <HTMLElement>el.parentElement
      })
      el.remove()
    })
  })

  export interface templateElement {
    parent: HTMLElement
    element: HTMLElement
  }

  export class template {
    public static templates: templateElement[] = []
  }
}
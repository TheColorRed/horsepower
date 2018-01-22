namespace hp {
  export class ajax {

    public static async fetch(url: string, options?: RequestInit) {
      let request = await fetch(url, options)
      let response = await request.text()
      try {
        return JSON.parse(response)
      } catch (e) {
        return response
      }
    }

    public static async submit(form: HTMLFormElement | component) {
      if (form instanceof HTMLFormElement || form.element && form.element instanceof HTMLFormElement) {
        let el = (form instanceof HTMLFormElement ? form : form.element) as HTMLFormElement
        let data = new FormData(el)
        let method = (el.method || 'get').toLowerCase()
        let q = method == 'get' ? `?${[...data.entries()].map((e: any) => encodeURIComponent(e[0]) + '=' + encodeURIComponent(e[1]))}` : ''
        return await this.fetch(el.action + q, {
          method,
          body: method == 'post' ? data : '',
          credentials: 'include',
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        })
      }
    }
  }
}
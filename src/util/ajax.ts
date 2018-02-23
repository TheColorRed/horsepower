namespace hp {
  export abstract class ajax {

    public static async fetch(url: string, options?: RequestInit) {
      let request = await fetch(url, options)
      let response = await request.text()
      try {
        let json = JSON.parse(response)
        // component.components.forEach(comp => typeof comp.ajax == 'function' && comp.ajax(json))
        return json
      } catch (e) {
        return response
      }
    }

    public static async get(url: string, data?: { [key: string]: any } | FormData, headers?: { [key: string]: any } | Headers) {
      let q: string[] = []
      if (data instanceof FormData) {
        Array.from(data.entries()).forEach((e: any) => q.push(encodeURIComponent(e[0]) + '=' + encodeURIComponent(e[1])))
      } else if (data) {
        for (let i in data) { q.push(encodeURIComponent(i) + '=' + encodeURIComponent(data[i])) }
      }
      return await this.fetch(url + (q.length > 0 ? '?' + q.join('&') : ''), { method: 'get', headers })
    }

    public static async post(url: string, data?: { [key: string]: any } | FormData, headers?: { [key: string]: any } | Headers) {
      let body
      if (data instanceof FormData) {
        body = data
      } else if (data) {
        body = new FormData
        for (let i in data) { body.set(i, data[i]) }
      }
      return await this.fetch(url, { method: 'post', body, headers })
    }

    public static async submit(form: HTMLFormElement | component) {
      if (form instanceof HTMLFormElement || (form.element && form.element instanceof HTMLFormElement)) {
        let el = (form instanceof HTMLFormElement ? form : form.element) as HTMLFormElement
        let data = new FormData(el)
        let method = (el.method || 'get').toLowerCase()
        let q = method == 'get' ? `?${Array.from(data.entries()).map((e: any) => encodeURIComponent(e[0]) + '=' + encodeURIComponent(e[1]))}` : ''
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
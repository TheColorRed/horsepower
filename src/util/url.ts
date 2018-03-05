namespace hp {
  export class url {

    public static get path() { return window.location.pathname }

    public static push(val: string, title: string = '') {
      let path = window.location.pathname.split('/')
      path.push(val)
      this.set(path.join('/') + window.location.hash, title)
    }

    public static pop(val: string, title: string = '') {
      let path = window.location.pathname.split('/')
      path.pop()
      this.set(path.join('/') + window.location.hash, title)
    }

    public static shift(val: string, title: string = '') {
      let path = window.location.pathname.split('/')
      path.shift()
      this.set(path.join('/') + window.location.hash, title)
    }

    public static unshift(val: string, title: string = '') {
      let path = window.location.pathname.split('/')
      path.unshift(val)
      this.set(path.join('/') + window.location.hash, title)
    }

    public static set(url: string, title: string = '') {
      history.pushState({}, title, url)
    }

    public static replace(url: string, title: string = '') {
      history.replaceState({}, title, url)
    }

    public static goto(url: string) {
      window.location.href = url
    }
  }
}
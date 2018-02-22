namespace hp {

  export interface proxy {
    [key: string]: any
  }

  export class proxy {

    private boundValues: { [key: string]: any } = {}
    private boundTo: component[] = []

    public constructor() {
      let $this = this
      return new Proxy(this, {
        set(obj, prop, val) {
          $this.boundTo.forEach(itm => {
            if (typeof itm.changed == 'function') {
              let propval = prop.valueOf()
              if ((Array.isArray(propval) && propval.indexOf('length') == -1) || !Array.isArray(obj)) {
                let oldVal = $this.boundValues[prop]
                if (oldVal != val) {
                  itm.changed(val, oldVal, prop.valueOf() as any)
                }
              }
            }
          })
          return Reflect.set($this.boundValues, prop, val)
        },
        get(obj, prop, val) {
          if ($this[prop.toString()]) {
            return $this[prop]
          }
          return Reflect.get($this.boundValues, prop)
        }
      })
    }

    public bind<T extends component>(...comp: T[]) {
      comp.forEach(c => {
        this.boundTo.indexOf(c) == -1 && this.boundTo.push(...comp)
      })
      return this
    }

    public unbind<T extends component>(...comp: T[]) {
      comp.forEach(c => {
        let idx = this.boundTo.indexOf(c)
        idx > -1 && this.boundTo.splice(idx, 1)
      })
      return this
    }

    public watch(...args: any[]): any {
      args.forEach(item => {
        if (item instanceof proxy) {
          this.proxies.push(item)
        }
      })
      // if (args.length == 2) {
      //   this.boundValues[args[0]] = args[1]
      // } else if (args.length == 1 && args[0] instanceof Object) {
      //   for (let itm in args[0]) {
      //     !(itm in this.boundValues) && (this.boundValues[itm] = args[0][itm])
      //   }
      // }
    }

  }
}
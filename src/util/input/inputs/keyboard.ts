namespace hp {
  export interface keyboardBinding {
    name: string
    keys: (string | number | RegExp)[]
  }

  export class keyboard extends userinput {
    private _key: string = ''
    private _keyModifier: string = ''
    private _code: number = -1
    private _shift: boolean = false
    private _ctrl: boolean = false
    private _alt: boolean = false
    private _evt?: KeyboardEvent

    public get key(): string { return this._key }
    public get keyModifier(): string { return this._keyModifier }
    public get code(): number { return this._code }
    public get shift(): boolean { return this._shift }
    public get ctrl(): boolean { return this._ctrl }
    public get alt(): boolean { return this._alt }

    public constructor(evt?: KeyboardEvent) {
      super()
      this._evt = evt
      if (evt) {
        this._code = evt.keyCode || -1
        this._shift = evt.shiftKey || false
        this._ctrl = evt.ctrlKey || false
        this._alt = evt.altKey || false
        let key: string[] = []
        this._ctrl && key.push('ctrl')
        this._alt && key.push('alt')
        this._shift && key.push('shift')
        key.push(evt.key)
        this._key = evt.key.toLowerCase()
        this._keyModifier = key.join('+').toLowerCase()
      }
    }

    private static keyboardBindings: keyboardBinding[] = [
      {
        name: 'vertical',
        keys: ['ArrowUp', 'ArrowDown', 'w', 's']
      },
      {
        name: 'horizontal',
        keys: ['ArrowLeft', 'ArrowRight', 'a', 'd']
      },
      {
        name: 'left',
        keys: ['ArrowLeft', 'a']
      },
      {
        name: 'right',
        keys: ['ArrowRight', 'd']
      },
      {
        name: 'up',
        keys: ['ArrowUp', 'w']
      },
      {
        name: 'down',
        keys: ['ArrowDown', 's']
      },
      {
        name: 'accept',
        keys: ['Enter']
      },
      {
        name: 'reject',
        keys: ['Esc']
      },
      {
        name: 'arrow',
        keys: ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']
      },
      {
        name: 'special',
        keys: [' ', '!', '"', '#', '$', '%', '&', '\'', '(', ')', '*', '+', ',', '-', '.', '/', ':', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '_', '`', '{', '|', '}', '~']
      },
      {
        name: 'navigation',
        keys: ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'End', 'Home', 'Insert', 'Delete', 'Backspace', 'PageUp', 'PageDown']
      },
      {
        name: 'function',
        keys: ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12']
      },
      {
        name: 'basic math',
        keys: ['/', '*', '-', '+', '=', '(', ')']
      },
      {
        name: 'math',
        keys: ['/', '*', '-', '+', '=', '(', ')', '%', '^', '|', '!', '<', '>']
      }
    ]

    /**
     * Tests if the key matches a binding or a character
     *
     * @param {(...(string | number)[])} names
     * @returns
     * @memberof keyboard
     */
    public is(...names: (string | number)[]) {
      for (let i = 0; i < names.length; i++) {
        let name = names[i].toString()
        if (name.toLowerCase() == this.key.toLowerCase()) return true
        let binding = keyboard.keyboardBindings.find(b => b.name.toLowerCase() == name.toLowerCase() && b.keys.indexOf(this.key) > -1 ? true : false)
        if (binding) return true
      }
      return false
    }

    /**
     * Gets a list of bindings that they key is apart of
     *
     * @returns
     * @memberof keyboard
     */
    public whichBindings() {
      return keyboard.keyboardBindings.filter(b => b.keys.indexOf(this.key) > -1)
    }

    /**
     * Checks to see if the key is blocked
     *
     * @param {(...(string | number | RegExp)[])} names
     * @returns
     * @memberof keyboard
     */
    public isBlocked(...names: (string | number | RegExp)[]) {
      if (names.length == 0) return true
      let keys = names.filter(n => !(n instanceof RegExp) && typeof n == 'string' && n.toLowerCase() === this.key.toLowerCase())
      let bindings = names.filter(n =>
        keyboard.keyboardBindings.find(b =>
          b.name == n && b.keys.map(i => !(i instanceof RegExp) && i.toString().toLowerCase()).indexOf(this.key) > -1
        )
      ).concat(
        names.filter(n =>
          keyboard.keyboardBindings.find(b =>
            b.name == n && b.keys.reduce((c: boolean[], v) => v instanceof RegExp && v.test(this.key) ? c.concat([true]) : c, []).length > 0
          )
        )
      )
      if (keys.length > 0) { return true }
      else if (bindings.length > 0) { return true }
      else {
        names.filter(n => n instanceof RegExp).forEach(regex => {
          if (regex instanceof RegExp && regex.test(this.key)) {
            return true
          }
        })
      }
      return false
    }

    /**
     * Prevents the default from happening if it matches the key, binding or regexp
     *
     * @param {(...(string | number | RegExp)[])} names
     * @returns
     * @memberof keyboard
     */
    public block(...names: (string | number | RegExp)[]) {
      if (this.isBlocked(...names)) this._evt && this._evt.preventDefault()
    }

    /**
     * Allows default to happen if it matches the key, binding or regexp
     *
     * @param {(...(string | number | RegExp)[])} names
     * @returns
     * @memberof keyboard
     */
    public allow(...names: (string | number | RegExp)[]) {
      if (!this.isAllowed(...names)) this._evt && this._evt.preventDefault()
    }

    /**
     * Checks to see if the key is allowed
     *
     * @param {(...(string | number | RegExp)[])} names
     * @returns
     * @memberof keyboard
     */
    public isAllowed(...names: (string | number | RegExp)[]) {
      let keys = names.filter(n => typeof n == 'string' && n.toLowerCase() === this.key.toLowerCase())
      let bindings = names.filter(n =>
        // Test string keybindings
        keyboard.keyboardBindings.find(b =>
          b.name == n && b.keys.map(i => typeof i == 'string' && i.toString().toLowerCase()).indexOf(this.key) > -1
        )
      ).concat(
        names.filter(n =>
          // Test regular expression key bindings
          keyboard.keyboardBindings.find(b =>
            b.name == n && b.keys.reduce((c: boolean[], v) => v instanceof RegExp && v.test(this.key) ? c.concat([true]) : c, []).length > 0
          )
        )
      )
      let regexps = names.filter(n => n instanceof RegExp && n.test(this.key))
      if (keys.length == 0 && bindings.length == 0 && regexps.length == 0) return false
      return true
    }

    /**
     * Adds a custom key binding
     *
     * @static
     * @param {string} name
     * @param {(...(string | number | RegExp)[])} keys
     * @memberof keyboard
     */
    public static add(name: string, ...keys: (string | number | RegExp)[]) {
      this.keyboardBindings.push({ name, keys })
    }

    /**
     * Removes a keybinding
     *
     * @static
     * @param {string} name
     * @memberof keyboard
     */
    public static remove(name: string) {
      let idx = this.keyboardBindings.findIndex(b => b.name == name)
      idx > -1 && this.keyboardBindings.splice(idx, 1)
    }
  }
}
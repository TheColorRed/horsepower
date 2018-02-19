namespace hp {

  export enum mouseButton { none = -1, left = 0, middle = 1, right = 2 }

  export interface mouseBindings {
    name: string
    buttons: number[]
  }

  export class mouse extends userinput {

    private button: mouseButton = mouseButton.none
    private _evt?: MouseEvent

    private static mouseBindings: mouseBindings[] = [
      {
        name: 'left',
        buttons: [0]
      },
      {
        name: 'middle',
        buttons: [1]
      },
      {
        name: 'right',
        buttons: [2]
      }
    ]

    public constructor(evt?: MouseEvent) {
      super()
      this._evt = evt
      this.button = evt && evt.button || -1
    }

    public is(name: string | mouseButton) {
      if (name == this.button) return true
      let binding = mouse.mouseBindings.find(b => b.name == name && b.buttons.indexOf(this.button) > -1 ? true : false)
      if (binding) return true
      return false
    }

    public whichBindings() {
      return mouse.mouseBindings.filter(b => b.buttons.indexOf(this.button) > -1)
    }

    public block(...names: (string | mouseButton)[]) {
      if (names.length == 0) { this._evt && this._evt.preventDefault() }
      else {
        names.forEach(name => {
          let binding = mouse.mouseBindings.find(b => b.name == name)
          if ((binding && binding.buttons.indexOf(this.button) > -1) || (!binding && name == this.button)) {
            this._evt && this._evt.preventDefault()
          }
        })
      }
    }

    public static add(name: string, ...buttons: number[]) {
      this.mouseBindings.push({ name, buttons })
    }

    public static remove(name: string) {
      let idx = this.mouseBindings.findIndex(b => b.name == name)
      idx > -1 && this.mouseBindings.splice(idx, 1)
    }

  }
}
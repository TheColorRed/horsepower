class disableEnable extends hp.formItem {
  disabled() {
    console.log('disabled')
  }
  enabled() {
    console.log('enabled')
  }
}

class toggleInput extends hp.button {
  clicked() {
    this.findComponent(disableEnable, input => input.disable(!input.inactive))
  }
}

hp.observe('[type=input]', disableEnable)
hp.observe('[type=button]', toggleInput)
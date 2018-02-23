class search extends hp.input {
  // Once the input is created get a list of json items
  async created() {
    this.disable(true)
    await this.ajax.get('/dogs')
  }
  ajaxResponse(data) {
    this.items = data
    this.disable(false)
    this.focus()
  }
  inputDelay(keyboard) {
    let val = this.value()
    if (val == '') this.rootScope.filtered = []
    else this.rootScope.filtered = Array.from(this.items)
      // Find matching items
      .filter(i => new RegExp(val, 'gi').test(i))
  }
}

class result extends hp.element {
  created() {
    this.html(this.text.replace(new RegExp(`(${this.rootScope.query})`, 'gi'), '<b>$1</b>'))
  }
}

hp.observe('input', search)
hp.observe('ol a', result)
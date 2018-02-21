class model extends hp.input {
  onScopeName(value) {
    /** @type {string[]} */
    let name = value.split(' ')
    this.rootScope.first = name.shift()
    this.rootScope.last = name.join(' ')
  }
}

hp.observe('input', model)
class model extends hp.input {
  onScopeName(value) {
    let [first, last] = value.split(' ')
    this.scope.first = first || ''
    this.scope.last = last || ''
  }
}

hp.observe('input', model)
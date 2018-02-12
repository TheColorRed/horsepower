class bind extends hp.input {

  created() {
    this.bindings = this.watch('a', [])
    this.watch('b', 1)
  }

  tick() {
    this.parentComponent(bind)
    this.bindings.a.push(Math.random() * 1000)
    this.bindings.b += 10
    return 1000
  }

  changed(key, value) {
    console.log(key, value)
  }
}

hp.observe('#bind', bind)
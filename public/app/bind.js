/// <reference path="../../lib/hp.d.ts"/>

class bind extends hp.input {
  created() {
    this.bind('a', [])
    let bindings = this.bind('b', 1)
    setInterval(() => {
      // bindings.a.push(Math.random() * 1000)
      bindings.a *= 10
    }, 2000)
  }

  changed(key, value) {
    console.log(key, value)
  }
}

hp.observe(bind, '#bind')
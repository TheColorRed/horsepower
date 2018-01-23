const watch = hp.watch({
  time: 0,
  start: Date.now()
})

class stopwatchwrapper extends hp.element {
  created() {
    this.append(`<div class="clock">0.0</div>
      <div class="btn-block">
        <input type="button" value="Start">
      </div>`)
  }
}

class stopwatch extends hp.element {

  created() { this.bind(watch) }

  tick() {
    watch.time = (Date.now() - watch.start) / 1000
    return 1
  }

  changed(newVal, oldVal, key) {
    this.findComponent(stopwatchbutton, btn => {
      key == 'time' && btn.getBoolean('data-running') && this.textContent((newVal).toFixed(1))
    })
  }
}

class stopwatchbutton extends hp.button {

  clicked() {
    this.closestComponent(stopwatchwrapper, item => {
      item.childComponent(stopwatch, item => {
        this.toggle('data-running')
        watch.start = Date.now()
      })
    })
  }

  modified() {
    this.setAttribute('value', this.getBoolean('data-running') ? 'Stop' : 'Start')
    this.css('background-color', this.getBoolean('data-running') ? 'green' : 'red')
  }
}

hp.observe(stopwatch, '.clock')
hp.observe(stopwatchwrapper, '.wrapper')
hp.observe(stopwatchbutton, 'input[type=button]')
const watch = hp.watch({
  running: false,
  time: 0,
  start: Date.now()
})

class stopwatchwrapper extends hp.element {
  created() {
    this.append(`<div class="clock">00:00:00.00</div>
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
    if (key == 'time' && watch.running) {
      this.findComponent(stopwatchbutton, btn => {
        let h = Math.floor(newVal / 3600).toString().padStart(2, '0')
        let m = Math.floor(newVal % 3600 / 60).toString().padStart(2, '0')
        let s = Math.floor(newVal % 3600 % 60).toString().padStart(2, '0')
        let ms = ((new String(newVal).split('.')[1] || '00').substr(0, 2)).padStart(2, '0')
        let t = `${h}:${m}:${s}.${ms}`
        this.textContent(t)
      })
    }
  }
}

class stopwatchbutton extends hp.button {

  created() { this.bind(watch) }

  clicked() {
    this.closestComponent(stopwatchwrapper, item => {
      item.childComponent(stopwatch, item => {
        watch.running = hp.toggle(watch.running)
        watch.start = Date.now()
      })
    })
  }

  changed() {
    this.value(watch.running ? 'Stop' : 'Start')
    this.css('background-color', watch.running ? 'green' : 'red')
  }
}

hp.observe(stopwatch, '.clock')
hp.observe(stopwatchwrapper, '.wrapper')
hp.observe(stopwatchbutton, 'input[type=button]')
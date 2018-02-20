class stopwatch extends hp.element {
  tick() {
    this.scope.time = (Date.now() - this.startTime) / 1000
    return 1
  }
  onScopeTime(val) {
    if (!this.running) return
    let h = Math.floor(val / 3600).toString().padStart(2, '0')
    let m = Math.floor(val % 3600 / 60).toString().padStart(2, '0')
    let s = Math.floor(val % 3600 % 60).toString().padStart(2, '0')
    let ms = ((new String(val).split('.')[1] || '00').substr(0, 2)).padStart(2, '0')
    this.scope.format = `${h}:${m}:${s}.${ms}`
  }
  start() {
    this.running = hp.toggle(this.running)
    this.startTime = Date.now()
  }
}

class stopwatchbutton extends hp.button {
  clicked() {
    this.broadcastTo(stopwatch, 'start')
    this.value(this.scope.running ? 'Stop' : 'Start')
    this.css('background-color', this.scope.running ? 'green' : 'red')
  }
}

hp.observe('.clock', stopwatch)
hp.observe('input[type=button]', stopwatchbutton)
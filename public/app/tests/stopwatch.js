class stopwatch extends hp.element {
  tick() {
    this.scope.time = (Date.now() - this.rootScope.startTime) / 1000
    return 1
  }
  onScopeTime(val) {
    if (!this.rootScope.running) return
    let h = Math.floor(val / 3600).toString().padStart(2, '0')
    let m = Math.floor(val % 3600 / 60).toString().padStart(2, '0')
    let s = Math.floor(val % 3600 % 60).toString().padStart(2, '0')
    let ms = ((new String(val).split('.')[1] || '00').substr(0, 2)).padStart(2, '0')
    this.scope.format = `${h}:${m}:${s}.${ms}`
  }
}

class stopwatchbutton extends hp.button {
  clicked() {
    this.rootScope.running = hp.toggle(this.rootScope.running)
    this.rootScope.startTime = Date.now()
    this.value(this.rootScope.running ? 'Stop' : 'Start')
    this.css('background-color', this.rootScope.running ? 'green' : 'red')
  }
}

hp.observe('.clock', stopwatch)
hp.observe('input[type=button]', stopwatchbutton)
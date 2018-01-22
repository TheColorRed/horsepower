/// <reference path="../../lib/hp.d.ts"/>

class stopwatchwrapper extends hp.component {
  created() {
    this.append(`<div class="clock">0.0</div>
      <div class="btn-block">
        <input type="button" value="Start">
      </div>`)
  }
}

class stopwatch extends hp.component {
  tick() {
    this.parentComponent(stopwatchwrapper, item => {
      item.childComponent(stopwatchbutton, btn => {
        let start = this.getInt('data-start')
        btn.getBoolean('data-running') && this.textContent(((Date.now() - start) / 1000).toFixed(1))
      })
    })
    return 1
  }
}

class stopwatchbutton extends hp.button {

  clicked() {
    this.parentComponent(stopwatchwrapper, item => {
      item.childComponent(stopwatch, item => {
        this.toggle('data-running')
        item.setAttribute('data-start', Date.now())
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
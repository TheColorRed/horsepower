/// <reference path="../../lib/hp.d.ts"/>

class clock extends hp.component {

  tick() {
    this.setAttribute('data-date', Date.now())
    return 1000
  }

  modified() {
    let date = new Date(this.getInt('data-date'))
    let hour = date.getHours()
    let min = date.getMinutes()
    let sec = date.getSeconds()
    this.textContent(`${hour > 12 ? hour - 12 : hour}:${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec} ${hour > 12 ? 'PM' : 'AM'}`)
  }

}

// Create an observer to watch items with the class "test"
// and watch for when they are added, removed or modified
hp.observe(clock, '.clock')
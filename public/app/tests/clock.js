class clock extends hp.element {
  tick() {
    let date = new Date()
    let hour = date.getHours()
    let min = date.getMinutes()
    let sec = date.getSeconds()
    this.scope.time = `${hour > 12 ? hour - 12 : hour}:${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec} ${hour > 12 ? 'PM' : 'AM'}`
    return 10
  }
}

hp.observe('.clock', clock)
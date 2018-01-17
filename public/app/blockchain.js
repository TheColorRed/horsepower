/// <reference path="../../lib/mutator.d.ts"/>

class blockchain extends mutator.component {

  childrenAdded(children) {
    let maxItems = 100
    if (this.childCount > maxItems) {
      let toRemove = this.childCount - maxItems
      while (toRemove--) {
        this.removeLast()
      }
    }
  }

  created() {
    let ws = new WebSocket('wss://www.bitmex.com/realtime?subscribe=trade:XBTUSD')

    ws.addEventListener('message', msg => {
      let res = JSON.parse(msg.data)
      res.data.forEach(item => {
        // let date = new Date(item.timestamp)
        this.prependElement(`div${item.side.toLowerCase() == 'buy' ? '.in' : '.out'}`, `
          <span>${(item.grossValue / 100000000).toFixed(8)}</span>
          <span>${(item.price).toFixed(2)}</span>
          <span>${this.time(item.timestamp)}</span>
        `)
      })
    })
  }

  time(time) {
    let dt = new Date(time)
    return dt.getHours() + ':' + dt.getMinutes() + ':' + dt.getSeconds()
  }

}

mutator.observe(blockchain, '#blocks')
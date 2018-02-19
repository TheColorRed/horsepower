class blockchain extends hp.websocket {
  // Configure the websocket settings
  config() { return { url: 'wss://www.bitmex.com/realtime?subscribe=instrument,trade:XBTUSD' } }

  // When children are added, remove children at the end of the list
  // We will end up with a maximum of 50 items in this list
  childrenAdded() {
    this.maxChildren(50)
  }

  // Once created, we can filter the socket messages by key
  // In this case we only care about messages with the key "table"
  created() {
    this.filter('table', 'trade', res => {
      res.data.forEach(item => {
        // Create a string element to generate an html element
        let element = item.side.toLowerCase() == 'buy' ? '.in' : '.out'
        // We will make one of the following:
        // .in   --to->   <div class="in"></div>
        // .out  --to->   <div class="out"></div>
        this.prependElement(element, `
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

hp.observe('#blocks', blockchain)
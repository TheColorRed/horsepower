namespace hp {

  export class WebSocketEvent {
    public constructor(public event: string | RegExp, public callback: (message: any) => void) { }
  }

  export class WebSocketCustomEvent {
    public constructor(public key: string | RegExp, public val: string | RegExp, public callback: (message: any) => void) { }
  }

  export abstract class websocket extends element {

    private _client?: WebSocket
    private _events: WebSocketEvent[] = []
    private _custevents: WebSocketCustomEvent[] = []
    private _containsevents: WebSocketCustomEvent[] = []
    private _isevents: WebSocketCustomEvent[] = []

    public get client(): WebSocket | undefined { return this._client }

    // Overwriteable methods
    public connect(evt: Event) { }
    public disconnected() { }
    public message(msg: object | string) { }
    public close(evt: CloseEvent) { }
    public error(evt: Event) { }
    public pong() { }

    abstract config(): string | {
      url: string
      protocols?: string | string[]
      reconnect?: boolean
      reconnectDelay?: number
    }

    public url: string = ''
    public protocols?: string | string[]

    private pingCount: number = 0
    private shouldReconnect: boolean = true
    private reconnectDelay?: number = 1000

    public constructor(element?: Element) {
      super(element)
      let cfg = this.config()
      if (typeof cfg == 'string') { this.url = cfg }
      else {
        this.url = cfg.url
        this.protocols = cfg.protocols || undefined
        this.shouldReconnect = cfg.reconnect || true
        this.reconnectDelay = cfg.reconnectDelay || 1000
      }
      if (this.url.length == 0) { throw new Error('A Socket URL is required') }
      this._client = new WebSocket(this.url, this.protocols)
      this._client.addEventListener('open', this.onOpen.bind(this))
      this._client.addEventListener('message', this.onMessage.bind(this))
      this._client.addEventListener('close', this.onClose.bind(this))
      this._client.addEventListener('error', this.onError.bind(this))
    }

    private onOpen(e: Event) {
      this.connect(e)
    }

    private onMessage(e: MessageEvent) {
      if (e.data.toLowerCase() == 'pong') {
        this.pong()
      } else {
        let data: any
        try {
          data = JSON.parse(e.data)
        } catch (err) {
          this.message(e.data)
        }
        // Watch for messages formatted {event:'name',message:any}
        this._events.forEach(evt => {
          if (data.event && data.message) {
            if (typeof evt.event == 'string') {
              data.event == evt.event && evt.callback(data.message || e.data)
            } else if (evt.event instanceof RegExp) {
              evt.event.test(data.event) && evt.callback(data.message || e.data)
            }
          }
        })
        // Watch for messages that have a particular key
        // or where the key has a particular value
        this._custevents.forEach(evt => {
          if (typeof data == 'object') {
            if (typeof evt.key == 'string') {
              !evt.val && data[evt.key] && evt.callback(data || e.data)
              evt.val && data[evt.key] && data[evt.key] == evt.val && evt.callback(data || e.data)
            } else if (evt.key instanceof RegExp) {
              for (let i in data) {
                let key = data[i]
                !evt.val && evt.key.test(key) && evt.callback(data || e.data)
                evt.val && evt.key.test(key) && data[i] == evt.val && evt.callback(data || e.data)
              }
            }
          }
        })
        // Watch for messages that have particular data
        this._containsevents.forEach(evt => {
          if (typeof evt.key == 'string') {
            if (evt.val == '=') {
              e.data.indexOf(evt.key) > -1 && evt.callback(data || e.data)
            } else if (evt.val == '!') {
              e.data.indexOf(evt.key) == -1 && evt.callback(data || e.data)
            }
          } else if (evt.key instanceof RegExp) {
            if (evt.val == '=') {
              evt.key.test(e.data) && evt.callback(data || e.data)
            } else if (evt.val == '!') {
              !evt.key.test(e.data) && evt.callback(data || e.data)
            }
          }
        })
        this._isevents.forEach(evt => {
          if (evt.val == '=') {
            evt.key == e.data && evt.callback(data || e.data)
          } else if (evt.val == '!') {
            evt.key != e.data && evt.callback(data || e.data)
          }
        })
        this.message(data || e.data)
      }
    }

    private onClose(e: CloseEvent) {
      this.close(e)
      if (this.shouldReconnect && !this._client) {
        setTimeout(() => {
          this._client = new WebSocket(this.url, this.protocols)
        }, this.reconnectDelay)
      }
    }

    private onError(e: Event) {
      this.error(e)
    }

    /**
     * Triggered when the socket is disconnected
     *
     * @param {number} [code]
     * @param {string} [reason]
     * @memberof websocket
     */
    public disconnect(code?: number, reason?: string) {
      this.shouldReconnect = false
      this._client && this._client.close(code, reason)
      this._client = undefined
    }

    /**
     * Emits data to the current socket
     *
     * @param {(Object | USVString | ArrayBuffer | Blob | ArrayBufferView)} message
     * @memberof websocket
     */
    public emit(message: Object | USVString | ArrayBuffer | Blob | ArrayBufferView) {
      if (message instanceof Object) {
        this._client && this._client.send(JSON.stringify(message))
      } else {
        this._client && this._client.send(message)
      }
    }

    /**
     * Watches for an event
     * The returning message must be formatted in the following way:
     * {event:'string',message:any}
     *
     * @param {string} event
     * @param {(message: any) => void} callback
     * @memberof websocket
     */
    public on(event: string, callback: (message: any) => void) {
      this._events.push(new WebSocketEvent(event, callback))
    }

    /**
     * Watches for a message that contains a particular string or RegExp
     *
     * @param {(string | RegExp)} search
     * @param {(message: any) => void} callback
     * @memberof websocket
     */
    public contains(search: string | RegExp, callback: (message: any) => void) {
      this._containsevents.push(new WebSocketCustomEvent(search, '=', callback))
    }

    /**
     * Watches for a message that does not contain a particular string or RegExp
     *
     * @param {(string | RegExp)} search
     * @param {(message: any) => void} callback
     * @memberof websocket
     */
    public excludes(search: string | RegExp, callback: (message: any) => void) {
      this._containsevents.push(new WebSocketCustomEvent(search, '!', callback))
    }

    /**
     * Watches for a message that are equal to the data
     *
     * @param {(string | RegExp)} search
     * @param {(message: any) => void} callback
     * @memberof websocket
     */
    public is(search: string, callback: (message: any) => void) {
      this._isevents.push(new WebSocketCustomEvent(search, '=', callback))
    }

    /**
     * Watches for a message that isn't equal to the data
     *
     * @param {(string | RegExp)} search
     * @param {(message: any) => void} callback
     * @memberof websocket
     */
    public isnt(search: string, callback: (message: any) => void) {
      this._isevents.push(new WebSocketCustomEvent(search, '!', callback))
    }

    /**
     * Watches for a particular object key
     *
     * @param {(string | RegExp)} key
     * @param {(message: any) => void} callback
     * @memberof websocket
     */
    public filter(key: string | RegExp, callback: (message: any) => void): void

    /**
     * Watches for a particular objet key with a particular value
     *
     * @param {(string | RegExp)} key
     * @param {(string | RegExp)} value
     * @param {(message: any) => void} callback
     * @memberof websocket
     */
    public filter(key: string | RegExp, value: string | RegExp, callback: (message: any) => void): void
    public filter(...args: any[]) {
      if (args.length == 3) {
        this._custevents.push(new WebSocketCustomEvent(args[0], args[1], args[2]))
      } else if (args.length == 2) {
        this._custevents.push(new WebSocketCustomEvent(args[0], '', args[1]))
      }
    }

    public ping(delay: number): void
    public ping(delay: number, count: number): void
    public ping(delay: number, message: Object | USVString | ArrayBuffer | Blob | ArrayBufferView): void
    public ping(delay: number, message: Object | USVString | ArrayBuffer | Blob | ArrayBufferView, count: number): void
    public ping(...args: any[]) {
      let delay: number = args[0]
      let message = 'ping'
      let count = -1
      // Set message
      if (args.length == 2 && typeof args[1] != 'number') { message = args[1] }
      if (args.length == 3 && typeof args[1] != 'number') { message = args[1] }
      // Set count
      if (args.length == 2 && typeof args[1] == 'number') { count = args[1] }
      if (args.length == 3 && typeof args[2] == 'number') { count = args[2] }
      setTimeout(() => {
        this.emit(message)
        if (count == -1) {
          this.ping(delay, message, count)
        } else {
          if (this.pingCount++ < count) {
            this.ping(delay, message, count)
          }
        }
      }, delay * 1000)
    }

  }
}
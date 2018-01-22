namespace hp {

  export class WebSocketEvent {
    public constructor(public event: string, public callback: (message: any) => void) { }
  }

  export class WebSocketCustomEvent {
    public constructor(public key: string, public val: string, public callback: (message: any) => void) { }
  }

  export abstract class websocket extends component {

    private _client?: WebSocket
    private _events: WebSocketEvent[] = []
    private _custevents: WebSocketCustomEvent[] = []

    public get client(): WebSocket | undefined { return this._client }

    // Overwriteable methods
    public connect(evt: Event) { }
    public disconnected() { }
    public message(msg: object | string) { }
    public close(evt: CloseEvent) { }
    public error(evt: Event) { }
    public pong() { }
    public config(): string | {
      url: string
      protocols?: string | string[]
      reconnect?: boolean
      reconnectDelay?: number
    } { return '' }

    public url: string = ''
    public protocols?: string | string[]

    private pingCount: number = 0
    private shouldReconnect: boolean = true
    private reconnectDelay: number = 1000

    public constructor(element?: HTMLElement) {
      super(element)
      let cfg = this.config()
      if (typeof cfg == 'string') { this.url = cfg }
      else {
        this.url = cfg.url
        this.protocols = cfg.protocols || undefined
        this.shouldReconnect = cfg.reconnect || true
        this.reconnectDelay = cfg.reconnectDelay || 1000
      }
      this._client = new WebSocket(this.url)
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
        try {
          let data = JSON.parse(e.data)
          this._events.forEach(evt => data.data.event == evt.event && evt.callback(data.message))
          this._custevents.forEach(evt => {
            !evt.val && data[evt.key] && evt.callback(data)
            evt.val && data[evt.key] && data[evt.key] == evt.val && evt.callback(data)
          })
          this.message(data)
        } catch (err) {
          this.message(e.data)
        }
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

    public disconnect(code?: number, reason?: string) {
      this.shouldReconnect = false
      this._client && this._client.close(code, reason)
      this._client = undefined
    }

    public emit(message: Object | USVString | ArrayBuffer | Blob | ArrayBufferView) {
      if (message instanceof Object) {
        this._client && this._client.send(JSON.stringify(message))
      } else {
        this._client && this._client.send(message)
      }
    }

    public on(event: string, callback: (message: any) => void) {
      this._events.push(new WebSocketEvent(event, callback))
    }

    public filter(key: string, callback: (message: any) => void): void
    public filter(key: string, value: string, callback: (message: any) => void): void
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
      }, delay)
    }

  }
}
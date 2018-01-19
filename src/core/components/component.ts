namespace mutator {

  export interface ComponentType<T extends component> {
    new(element?: HTMLElement): T
    tick(components: component[]): void
    runStaticTick(comp: ComponentType<T>, tick?: number): void
  }

  export interface component {
    ajax(data: any): void
    created(mutation?: MutationRecord): void
    modified(oldValue: any, newValue: any, attr: any, mutation?: MutationRecord): void
    deleted(mutation?: MutationRecord): void
    childrenAdded(children: NodeList): void
    childrenRemoved(children: NodeList): void
    tick(): any
  }

  export class Observer<T extends component> {
    public readonly component: ComponentType<T>
    public readonly selectors: string[]

    public constructor(component: ComponentType<T>, ...selectors: string[]) {
      this.component = component
      this.selectors = selectors
    }
  }

  export abstract class component extends dom {

    public static observer: MutationObserver
    public static observers: Observer<any>[] = []
    public static components: component[] = []

    public hasCreated: boolean = false

    public constructor(element?: HTMLElement) {
      super(element)
      component.components.push(this)
    }

    // Overwriteable methods
    static tick(): any { }


    public static getElementsComponent<T extends component>(comp: ComponentType<T>, element: HTMLElement) {
      return this.components.find(c => c instanceof comp && c.element == element) as T
    }

    public static getElementsComponents<T extends component>(comp: ComponentType<T>, element: HTMLElement) {
      return this.components.filter(c => c instanceof comp && c.element == element) as T[]
    }

    public findComponent<T extends component>(comp: ComponentType<T>, callback?: (comp: T) => void) {
      let c = component.components.find(c => c instanceof comp) as T
      c instanceof component && typeof callback == 'function' && callback(c)
      return c
    }

    public findComponents<T extends component>(comp: ComponentType<T>, callback?: (comp: T[]) => void) {
      let c = component.components.filter(c => c instanceof comp) as T[]
      typeof callback == 'function' && callback(c)
      return c
    }

    public parentComponent<T extends component>(comp: ComponentType<T>, callback?: (component: T) => void): T | null {
      let parent = this._parentComponent<T>(comp, this.element)
      parent && typeof callback == 'function' && callback(parent)
      return parent
    }

    private _parentComponent<T extends component>(comp: ComponentType<T>, target?: HTMLElement): T | null {
      let parent = target ? target.parentElement : this.element.parentElement
      if (parent) {
        let c = component.components.find(c => c instanceof comp && c.element == parent)
        if (!c) {
          return this._parentComponent(comp, parent)
        }
        return c as T
      }
      return null
    }

    public childComponent<T extends component>(comp: ComponentType<T>, callback?: (item: T) => void): T | null {
      let items = Array.from(this.element.querySelectorAll('*'))
      let c = component.components.find(c => c instanceof comp && items.indexOf(c.element) > -1) as T
      c && typeof callback == 'function' && callback(c)
      return c
    }

    public childComponents<T extends component>(comp: ComponentType<T>) {
      let items = Array.from(this.element.querySelectorAll('*'))
      return component.components.filter(c => c instanceof comp && items.indexOf(c.element) > -1) as T[]
    }

    public static createNewComponent<T extends component>(element: HTMLElement, comp: ComponentType<T>, mutation: MutationRecord) {
      let item = this.components.find(c => c.element == element && c instanceof comp)
      if (!item) {
        let c = new comp(element)
        typeof c.created == 'function' && c.created(mutation)
        c.hasCreated = true
        let newval: any = null
        mutation.attributeName && (newval = element.getAttribute(mutation.attributeName))
        this.components.filter(comp => comp.element == element).forEach(c => c.hasCreated && typeof c.modified == 'function' && c.modified(mutation.oldValue, newval, mutation.attributeName, mutation))
        // Run the individual ticker for the component
        if (typeof c.tick == 'function') {
          let tick = c.tick()
          if (typeof tick == 'number') {
            c.runTick(tick)
          }
        }
      }
    }

    private runTick(tick?: number) {
      if (typeof tick == 'number') {
        setTimeout(() => {
          let tick = this.tick()
          if (typeof tick == 'number') {
            this.runTick(tick)
          }
        }, tick)
      }
    }

    public static runStaticTick<T extends component>(comp: ComponentType<T>, tick?: number) {
      if (typeof tick == 'number') {
        setTimeout(() => {
          let tick = comp.tick(this.components.filter(c => c instanceof comp))
          if (typeof tick == 'number') {
            this.runStaticTick(comp, tick)
          }
        }, tick)
      }
    }

  }
}
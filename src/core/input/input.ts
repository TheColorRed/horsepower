namespace hp {
  export abstract class userinput {
    public abstract is(...name: string[]): boolean
    public abstract whichBindings(): any[]
    public abstract block(...names: string[]): void
  }
}
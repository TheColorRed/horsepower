namespace hp {
  export function choose(items: any[]) {
    return items[Math.floor(Math.random() * items.length)]
  }
}
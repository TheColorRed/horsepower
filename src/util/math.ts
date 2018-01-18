namespace mutator {
  export function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(min, value), max)
  }

  export function clamp01(value: number) {
    return clamp(value, 0, 1)
  }
}
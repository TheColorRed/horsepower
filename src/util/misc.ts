namespace hp {

  /**
   * Toggles a boolean like value and returns its opposite
   *
   * @export
   * @param {*} value
   * @returns {typeof value}
   */
  export function toggleValue(value: any): typeof value {
    switch (typeof value) {
      case 'boolean':
        return !value
      case 'string':
        if (value === 'true') return 'false'
        if (value === 'false') return 'true'
        if (value === '1') return '0'
        if (value === '0') return '1'
        return ''
      case 'number':
        return value > 0 ? 0 : 1
      default:
        return false
    }
  }

  /**
   * Toggles a boolean like value and returns its opposite as a boolean
   *
   * @export
   * @param {*} value
   * @returns {boolean}
   */
  export function toggle(value: any): boolean {
    let v = toggleValue(value)
    if (typeof v == 'string') {
      v = ['false', '0', ''].indexOf(v) > -1 ? false : true
    }
    if (typeof v == 'number') {
      v = v > 0 ? true : false
    }
    return v
  }
}
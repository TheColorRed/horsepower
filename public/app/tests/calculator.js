const calc = hp.watch({ str: '0' })

let lastCalc = '0'
function evaluate(val) {
  val = val ? val : calc.str
  let r = val.toString().split(/([^\d\.])/).map(v => v.replace(/^0/g, '').replace(/×/g, '*').replace(/÷/g, '/'))
  try { lastCalc = eval(r.join('')).toString() } catch (e) { }
  return lastCalc
}

class output extends hp.element {
  created() { this.bind(calc) }
  changed(newVal) {
    let str = this.toVisual(newVal)
    str = str.length == 0 ? '0' : str
    if (this.id == 'result') this.textContent(str == '0' ? '0' : evaluate(newVal))
    else this.textContent(str)
  }
  toVisual(val) {
    let r = val.toString().split(/([^\d\.])/g).map(v => v.replace(/^0(\d)/g, '$1').replace(/\*/g, '×').replace(/\//g, '÷'))
    return r.join('')
  }
}

class input extends hp.button {
  clicked() {
    let val = this.value()
    if (val == 'DEL') calc.str = calc.str.substr(0, calc.str.length - 1)
    else if (val == '=') calc.str = evaluate()
    else if (val == '.' && calc.str.indexOf('.') == -1) calc.str += val
    else if (/^(\d|÷|×|-|\+)+$/.test(val)) calc.str += val
  }
  heldDown() {
    calc.str = this.value() == 'DEL' ? '0' : calc.str
  }
}

class body extends hp.element {
  keyup(val) {
    if (val == '.' && calc.str.indexOf('.') == -1) calc.str += val
    else if (/^(\d|\/|\*|-|\+)+$/.test(val)) calc.str += val
  }
  keydown(val, code) {
    if (code == 13) calc.str = evaluate()
    else if (code == 8) calc.str = calc.str.substr(0, calc.str.length - 1)
  }
}

hp.observe(document, body)
hp.observe('output', output)
hp.observe('input[type=button]', input)
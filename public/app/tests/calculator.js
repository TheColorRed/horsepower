class output extends hp.element {
  created() {
    this.rootScope.problem = '0'
    this.lastCalc
  }
  onBindingProblem(newVal) {
    this.rootScope.problem = newVal.split(/([^\d\.])/g)
      .map(v => v.replace(/^0(\d)/g, '$1').replace(/\*/g, '×').replace(/\//g, '÷')).join('')
      .replace(/((×|\+|-|÷)(×|\+|-|÷))+/g, '$2')
    if (!this.rootScope.problem) this.rootScope.problem = '0'
    this.evaluate()
  }
  deleteLast() {
    this.rootScope.problem = this.rootScope.problem.substr(0, this.rootScope.problem.length - 1)
  }
  evaluate() {
    let val = this.rootScope.problem
    let r = val.toString().split(/([^\d\.])/).map(v => v.replace(/^0/g, '').replace(/×/g, '*').replace(/÷/g, '/'))
    try { this.rootScope.result = eval(r.join('')).toString() } catch (e) { }
  }
  apply() {
    this.evaluate()
    this.rootScope.problem = this.rootScope.result
    this.rootScope.result = '0'
  }
}

class button extends hp.button {
  clicked() {
    let val = this.value()
    if (val == 'DEL') this.broadcastTo(output, 'deleteLast')
    else if (val == '=') this.broadcastTo(output, 'apply')
    else if (val == '.' && this.rootScope.problem.indexOf('.') == -1) this.rootScope.problem += val
    else if (/^(\d|÷|×|\-|\+)+$/.test(val)) this.rootScope.problem += val
  }
  heldDown() {
    this.rootScope.problem = this.value() == 'DEL' ? '0' : this.rootScope.problem
  }
}

class body extends hp.element {
  keyup(keyboard) {
    if (keyboard.isAllowed(/\d|\/|\*|-|\+/, '.', 'backspace')) {
      if (keyboard.key == 'backspace') this.broadcastTo(output, 'deleteLast')
      else this.rootScope.problem += keyboard.key
    }
  }
  keydown(keyboard) {
    keyboard.isAllowed('accept') && this.broadcastTo(output, 'apply')
  }
}

hp.observe(document, body)
hp.observe('output#problem', output)
hp.observe('input[type=button]', button)
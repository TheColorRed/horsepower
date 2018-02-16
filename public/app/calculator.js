const calc = hp.watch({ str: '0' })
class calcNumber extends hp.button {
  clicked() {
    let val = this.value()
    if (val == 'DEL') calc.str = '0'
    else calc.str += val
    this.findElement('output', output => {
      output instanceof hp.element && output.textContent(calc.str)
    })
  }
}

class body extends hp.element {
  keyup() {
    console.log('here')
  }
}

hp.observe('input[type=button]', calcNumber)
hp.observe(document, body)
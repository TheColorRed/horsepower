/// <reference path="../../lib/mutator.d.ts"/>

class form extends mutator.form {
  ajax(response) {
    response.array.forEach(number => this.afterElement('div', number))
    this.afterElement('div', response.object.a)
    response.object.b.forEach(item => this.afterElement('div', item))
    response.object.c.forEach(item => this.afterElement('div', `name: ${item.name}`))
  }
}

mutator.observe(form, 'form')
class form extends hp.form {
  ajax(response) {
    response.array.forEach(number => this.afterElement('div', number))
    this.afterElement('div', response.object.a)
    response.object.b.forEach(item => this.afterElement('div', item))
    response.object.c.forEach(item => this.afterElement('div', `name: ${item.name}`))
  }
}

hp.observe('form', form)
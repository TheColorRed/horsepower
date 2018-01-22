/// <reference path="../../lib/hp.d.ts"/>

class add extends hp.input {
  // Bind the accpet action to the input box
  // This will bind the enter key to the element
  accept(value) {
    if (value.length < 3) return
    this.findComponent(checklist, item => {
      item.appendElement('li', `<label><input type="checkbox"> <span>${value}</span></label>`)
      this.value('')
    })
  }

  reject() {
    this.value('')
  }

}

class checkbox extends hp.checkbox {
  // When the checkbox has been clicked/toggled add a class to the list item
  // The css will then display a strike through the element
  check(checked) {
    this.parentComponent(listitem, item => item.enableClass(checked, 'completed'))
  }
}

class remove extends hp.button {
  // When the accept button is clicked, we will remove all listitem components
  // where the checkbox component is checked
  clicked() {
    this.findComponents(checkbox, items => {
      items.forEach(item => {
        item.checked && item.parentComponent(listitem, itm => itm.removeElement())
      })
    })
  }
}

class listitem extends hp.element { }
class checklist extends hp.element { }

hp.observe(add, '#newitem')
hp.observe(remove, 'input[type=button]')
hp.observe(checkbox, 'input[type=checkbox]')
hp.observe(checklist, '#checklist')
hp.observe(listitem, '#checklist > li')
/// <reference path="../../lib/mutator.d.ts"/>

class add extends mutator.input {
  // Bind the accpet action to the input box
  // This will bind the enter key to the element
  accept(value) {
    if (value.length < 3) return
    this.findComponent(checklist, item => {
      item.appendElement('li', `<label><input type="checkbox"> <span>${value}</span></label>`)
      this.value('')
    })
  }
}

class checkbox extends mutator.checkbox {
  // When the checkbox has been clicked/toggled add a class to the list item
  // The css will then display a strike through the element
  check(checked) {
    this.parentComponent(listitem, item => item.enableClass(checked, 'completed'))
  }
}

class remove extends mutator.button {
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

class listitem extends mutator.component { }
class checklist extends mutator.component { }

mutator.observe(add, '#newitem')
mutator.observe(checkbox, 'input[type=checkbox]')
mutator.observe(remove, 'input[type=button]')
mutator.observe(checklist, '#checklist')
mutator.observe(listitem, '#checklist > li')
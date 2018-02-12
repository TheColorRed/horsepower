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
    this.closestComponent(listitem, item => item.enableClass(checked, 'completed'))
  }
}

class remove extends hp.button {
  // When the accept button is clicked, we will remove all listitem components
  // where the checkbox component is checked
  clicked() {
    this.findComponents(checkbox, items => {
      items.forEach(item => {
        item.checked && item.closestComponent(listitem, itm => itm.removeElement())
      })
    })
  }
}

class listitem extends hp.element { }
class checklist extends hp.element { }

hp.observe('#newitem', add)
hp.observe('input[type=button]', remove)
hp.observe('input[type=checkbox]', checkbox)
hp.observe('#checklist', checklist)
hp.observe('#checklist > li', listitem)
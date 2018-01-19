/// <reference path="../../lib/mutator.d.ts"/>

class newitem extends mutator.component {
  confirm(value) {
    this.findComponent(checklist, item => {
      if (value.length > 3) {
        item.appendElement('li', `<label><input type="checkbox"> <span>${value}</span></label>`)
        this.value('')
      }
    })
  }
}

class checkbox extends mutator.component {
  check(val) {
    this.parentComponent(listitem, item => item.enableClass(val, 'completed'))
  }
}

class remove extends mutator.component {
  confirm() {
    this.findComponents(checkbox, items => {
      items.forEach(item => {
        item.checked && item.parentComponent(listitem, itm => itm.removeElement())
      })
    })
  }
}

class listitem extends mutator.component { }
class checklist extends mutator.component { }

mutator.observe(newitem, '#newitem')
mutator.observe(checkbox, 'input[type=checkbox]')
mutator.observe(remove, 'input[type=button]')
mutator.observe(checklist, '#checklist')
mutator.observe(listitem, '#checklist > li')
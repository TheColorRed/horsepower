hp.observe('.loop-a', class extends hp.template {
  bind() {
    return {
      template: `<div hp-for="main in :data">
        {{main.name}}
        <div hp-for="child in main.children">
          {{child.name}}
        </div>
      </div>`,
      data: [{
        name: 'Billy',
        children: [{ name: 'Tom' }, { name: 'Mark' }, { name: 'Beth' }]
      }, {
        name: 'Jill',
        children: [{ name: 'Sally' }, { name: 'Sue' }]
      }]
    }
  }
})

// hp.observe('.loop-a', class extends hp.template {
//   bind() {
//     return {
//       template: `<div hp-for="index from 0 through 10">{{index}}</div>`
//     }
//   }
// })

// hp.observe('.loop-b', class extends hp.template {
//   bind() {
//     return {
//       template: `<div hp-for="index from 1 to 10">{{index}}</div>`
//     }
//   }
// })

// hp.observe('.loop-c', class extends hp.template {
//   bind() {
//     return {
//       template: `<div hp-for="index from 0 through 20 by 2">{{index}}</div>`
//     }
//   }
// })

// hp.observe('.loop-d', class extends hp.template {
//   bind() {
//     return {
//       template: `<div hp-for="index from 20 through 0 by 2">{{index}}</div>`
//     }
//   }
// })
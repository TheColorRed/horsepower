const itemColors = ['Red', 'Green', 'Blue', 'Yellow', 'Black', 'White', 'Orange', 'Purple', 'Pink']
const itemTypes = ['Dress', 'Shirt', 'Shoes', 'Jeans', 'Blouse', 'Socks', 'Coat', 'Watch']

hp.rootScope.cart = []
hp.rootScope.items = []

class item extends hp.element {
  created() {
    this.elementid = Math.random() * 1000
    this.price = parseFloat((Math.random() * 100).toFixed(2))
    this.title = hp.choose(itemColors) + ' ' + hp.choose(itemTypes)
    this.instock = Math.random() > 0.5
    this.append('h2', this.title)
    this.append('div', 'Price: $' + this.price)
    !this.instock && this.append('p.out-of-stock', 'Out of stock')
    this.append(`input[type=button][value="Add to Cart"]${!this.instock ? ':disabled' : ''}`)
    hp.rootScope.items.push(this)
  }
}

class addToCartBtn extends hp.button {
  created() { console.log('here') }
  clicked() { hp.rootScope.cart.push(this.closestComponent(item)) }
}

class removeItemBtn extends hp.link {
  clicked() {
    let id = this.getAttribute('data-id') || ''
    let idx = this.rootScope.cart.findIndex(i => i.elementid == id)
    idx > -1 && this.rootScope.cart.splice(idx, 1)
  }
}

class cart extends hp.element {
  onScopeCart() {
    this.findElement('.empty', item => item.enableClass(this.rootScope.cart.length > 0, 'hidden'))
    this.scope.subtotal = parseFloat(this.rootScope.cart.reduce((sum, val) => sum + val.price, 0).toFixed(2))
    this.scope.tax = parseFloat((this.scope.subtotal * .0765).toFixed(2))
    this.scope.total = parseFloat((this.scope.subtotal + this.scope.tax).toFixed(2))
  }
}

hp.observe('.cart', cart)
hp.observe('.items > .item', item)
hp.observe('.items > .item > input', addToCartBtn)
hp.observe('.cart-items > .cart-item > .remove', removeItemBtn)
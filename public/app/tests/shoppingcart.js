const itemColors = ['Red', 'Green', 'Blue', 'Yellow', 'Black', 'White', 'Orange', 'Purple', 'Pink']
const itemTypes = ['Dress', 'Shirt', 'Shoes', 'Jeans', 'Blouse', 'Socks', 'Coat', 'Watch']

class cartitems extends hp.element {
  add(cartItem) {
    if (cartItem instanceof item) {
      this.appendElement(`div.cart-item[data-id=${cartItem.id}]`, `
        <span><a class="remove" href="">&times;</a> ${cartItem.title}</span>
        <span data-price="${cartItem.price}">$${cartItem.price}</span>
      `)
    }
  }
  childrenChanged() {
    this.broadcastTo(totals, 'adjust', this.total)
    this.findElement('.empty', item => item.enableClass(this.childCount > 0, 'hidden'))
  }
  get total() {
    return this.findChildElements('div>span:last-child').reduce((sum, val) => sum + val.getFloat('data-price'), 0)
  }
}

class cartitem extends hp.element {
  removed() {
    this.broadcastTo(item, 'enable', this.getAttribute('data-id'))
  }
}

class totals extends hp.element {
  adjust(total) {
    let subTotal = total, tax = subTotal * .0765, totalAmount = subTotal + tax
    this.findChildElement(':nth-child(1)>span:last-child', div => div.textContent(`$${subTotal.toFixed(2)}`))
    this.findChildElement(':nth-child(2)>span:last-child', div => div.textContent(`$${tax.toFixed(2)}`))
    this.findChildElement(':nth-child(3)>span:last-child', div => div.textContent(`$${totalAmount.toFixed(2)}`))
  }
}

class item extends hp.element {
  created() {
    this.id = '_' + Math.floor(Math.random() * 1000)
    this.price = (Math.random() * 100).toFixed(2)
    this.title = hp.choose(itemColors) + ' ' + hp.choose(itemTypes)
    this.appendElement('h2', this.title)
    this.appendElement('div', 'Price: $' + this.price)
    this.appendElement(`input[type=button][value="Add to Cart"]`)
  }
  disable(id) {
    if (this.id != id) return
    this.addClass('added')
    this.findChildComponent(addToCartBtn, btn => btn.disabled(true))
  }
  enable(id) {
    if (this.id != id) return
    this.removeClass('added')
    this.findChildComponent(addToCartBtn, btn => btn.disabled(false))
  }
}

class addToCartBtn extends hp.button {
  clicked() {
    this.closestComponent(item, item => {
      item.broadcast('disable', item.id)
      this.broadcastTo(cartitems, 'add', item)
    })
  }
}

class removeCartItem extends hp.link {
  clicked() {
    this.closestComponent(cartitem, item => item.removeElement())
  }
}

hp.observe('.items > .item', item)
hp.observe('.item input[type=button]', addToCartBtn)
hp.observe('.cart-items', cartitems)
hp.observe('.cart-items .cart-item', cartitem)
hp.observe('.cart-items .remove', removeCartItem)
hp.observe('.totals', totals)
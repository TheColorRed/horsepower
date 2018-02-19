// Creates a custom keybinding
hp.keyboard.add('my keybinding', /\d|-/)

class inputblock extends hp.input {
  keydown(keyboard) {
    // Blocks everything
    this.hasClass('all') && keyboard.block()
    // Blocks "a", "b", "c" and special characters
    this.hasClass('abc') && keyboard.block('a', 'b', 'c', 'special')
    // Allows numbers, decimals, basic math and navigation
    this.hasClass('numbers') && keyboard.allow(/\d/, '.', 'basic math', 'navigation')
    // Blocks the custom keybinnding
    this.hasClass('custom') && keyboard.allow('my keybinding')
  }
}

hp.observe('input[type=text]', inputblock)
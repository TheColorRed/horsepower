class creation extends hp.element {
  // Create a 'creation' ticker
  // All 'creation' components will share this static ticker
  static tick(components) {
    document.body.insertAdjacentHTML('beforeend', '<div class="test"></div>')
    return 100
  }
  created() {
    this.textContent(`Created: ${creation.count++} items`)
    this.destroy(2)
  }
}
creation.count = 0
// Create an observer to watch items with the class "test"
// and watch for when they are added, removed or modified
hp.observe('.test', creation)
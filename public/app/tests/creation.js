class creation extends hp.element {
  // Create a 'creation' ticker
  // All 'creation' components will share this static ticker
  static tick(components) {
    document.body.insertAdjacentHTML('beforeend', '<div class="test"></div>')
    return 100
  }
  onScopeCount() {
    console.log('here')
  }
  created() {
    // Add text to the created element
    this.rootScope.count = this.rootScope.count > 0 ? this.rootScope.count + 1 : 0
    this.textContent(`Created: ${this.rootScope.count} items`)
    this.destroy(2)
  }
}

// Create an observer to watch items with the class "test"
// and watch for when they are added, removed or modified
hp.observe('.test', creation)
/// <reference path="../../lib/hp.d.ts"/>

class creation extends hp.component {

  // Create a 'creation' ticker
  // All 'creation' components will share this static ticker
  static tick(components) {
    if (components.length < 20) {
      document.body.insertAdjacentHTML('beforeend', '<div class="test"></div>')
      return 100
    }
  }

  created() {
    // Add text to the created element
    this.textContent(`Created: ${++creation.count} items`)
  }

}

// Create a static counter
creation.count = 0

// Create an observer to watch items with the class "test"
// and watch for when they are added, removed or modified
hp.observe(creation, '.test')
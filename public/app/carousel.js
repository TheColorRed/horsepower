class carouselNextPrev extends hp.element {
  // Once the next/previous button is clicked
  // tell the carousel item to translate
  clicked() {
    this.broadcastTo(carouselItem, 'translate', this.getAttribute('direction'))
  }
}

class keyboardControls extends hp.element {
  // Once a left/right keyboard key is pressed
  // tell the carousel item to translate
  keyup(input) {
    input.is('left') && this.broadcastTo(carouselItem, 'translate', 'prev')
    input.is('right') && this.broadcastTo(carouselItem, 'translate', 'next')
  }
}

class carouselItem extends hp.element {
  // Set the default offset to zero
  created() { this.offset = 0 }
  // Traslate is called when something is bradcasted to it
  // See: 'keyboardControls' and 'carouselNextPrev' for implementation
  translate(direction) {
    // If next is called move the div to the left (subtracting pixels from the position)
    this.offset -= direction == 'next' && Math.abs(this.offset) + this.width < this.scrollWidth ? this.width : 0
    // If prev is called move the div to the right (adding pixels to the position)
    this.offset += direction == 'prev' && this.offset < 0 ? this.width : 0
    // Set the new position and let the css take care of the animation
    this.css('transform', `translateX(${this.offset}px)`)
  }
}

hp.observe('#carousel>.next-prev', carouselNextPrev)
hp.observe('#carousel>.items', carouselItem)
hp.observe(document, keyboardControls)
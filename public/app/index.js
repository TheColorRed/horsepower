class nav extends hp.element {
  created() {
    hp.ajax.get('/nav')
  }
  ajax(response) {
    Array.isArray(response) && response.forEach(item => {
      this.appendElement(`li${item.active ? '.active' : ''}`, `<a href="${item.file}">${item.name}</a>`)
      item.active && this.findElement('iframe', iframe => iframe.setAttribute('src', item.file))
    })
  }
}

class navLink extends hp.link {
  clicked() {
    this.broadcastTo(navLink, 'deactivate')
    this.closestElement('li', li => li.addClass('active'))
    this.findElement('iframe', item => item.setAttribute('src', this.href))
    // hp.ajax.get('/source' + this.path.replace(/html$/, 'js'))
  }
  deactivate() {
    this.closestElement('li', li => li.removeClass('active'))
  }
}

hp.observe('#nav ul', nav)
hp.observe('#nav a', navLink)
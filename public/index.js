const express = require('express')
const path = require('path')
const fs = require('fs')
const compress = require('compression')

const app = express()

app.use(compress())
app.use('/horsepower', express.static(path.join(__dirname, '../lib')))
app.use('/test', express.static(path.join(__dirname, './app/tests')))
app.use('/app', express.static(path.join(__dirname, './app')))
app.use('/css', express.static(path.join(__dirname, './css')))

app.all(/\/ajax\/.*/, (req, res) => {
  res.json({
    array: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
    object: {
      a: true,
      b: ['a', 'b', 'c'],
      c: [{ name: 'Billy' }, { name: 'Bob' }, { name: 'Joe' }]
    }
  })
})

app.get('/nav', (req, res) => {
  res.json([
    { name: 'Ajax', file: '/html/ajax.html' },
    { name: 'Binding', file: '/html/bind.html' },
    { name: 'Search', file: '/html/search.html' },
    { name: 'Blockchain Websocket', file: '/html/blockchain.html' },
    { name: 'Calculator', file: '/html/calculator.html' },
    { name: 'Carousel', file: '/html/carousel.html' },
    { name: 'Checklist', file: '/html/checklist.html' },
    { name: 'Clock', file: '/html/clock.html' },
    { name: 'Creation', file: '/html/creation.html' },
    { name: 'Allow/Block Input', file: '/html/inputblock.html' },
    { name: 'Stopwatch', file: '/html/stopwatch.html' },
    { name: 'Shopping Cart', file: '/html/shoppingcart.html' },
    { name: 'Disable Enable', file: '/html/disableEnable.html' },
    { name: 'Loops', file: '/html/loops.html', active: true }
  ].sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1))
})

app.get('/dogs', (req, res) => {
  res.sendFile(path.join(__dirname, 'dogs.json'))
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'index.html'))
})

app.get(/\/source.+/, (req, res) => {
  if (req.path.endsWith('js')) {
    res.sendFile(path.join(__dirname, 'app/tests', path.parse(req.path).base))
  } else if (req.path.endsWith('html')) {
    res.sendFile(path.join(__dirname, 'html', path.parse(req.path).base))
  } else {
    res.sendStatus(404)
  }
})

app.get(/\.html$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'html/tests', path.parse(req.path).base))
})

app.listen(3030, () => console.log('Listening on port 3030'))
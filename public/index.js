const express = require('express')
const path = require('path')
const fs = require('fs')

const app = express()

// app.use(express.static(path.join(__dirname, 'html')))
// app.use(express.static(path.join(__dirname, 'public')))
app.use('/horsepower', express.static(path.join(__dirname, '../lib')))
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

app.get(/\.html$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'html', path.parse(req.path).base))
})

app.listen(3030, () => console.log('Listening on port 3030'))
const express = require('express')
const path = require('path')
const fs = require('fs')

const app = express()

// app.use(express.static(path.join(__dirname, 'html')))
// app.use(express.static(path.join(__dirname, 'public')))
app.use('/mutator', express.static(path.join(__dirname, '../lib')))
app.use('/app', express.static(path.join(__dirname, './app')))


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

// app.get(/^\/mutator/, (req, res) => {
//   res.setHeader('content-type', 'text/javascript')
//   let location = getPath(req.path, path.join(__dirname, '../lib'))
//   // console.log(location)
//   if (location) {
//     return res.send(fs.readFileSync(location))
//   }
//   res.sendStatus(404)
// })

// app.get(/^\/app/, (req, res) => {
//   res.setHeader('content-type', 'text/javascript')
//   let location = getPath(req.path)
//   if (location) {
//     return res.send(fs.readFileSync(location))
//   }
//   res.sendStatus(404)
// })

// function getPath(filePath, root) {
//   root = !root ? __dirname : root
//   // console.log(root)
//   if (filePath.indexOf('.') == -1) {
//     // console.log(filePath)
//     console.log(path.join(root, filePath + '.js'))
//     if (fs.existsSync(path.join(root, filePath + '.js'))) {
//       return path.join(root, filePath + '.js')
//     }
//     if (fs.existsSync(path.join(root, filePath, 'index.js'))) {
//       return path.join(root, filePath, 'index.js')
//     }
//     if (fs.existsSync(path.join(root, 'index.js'))) {
//       return path.join(root, 'index.js')
//     }
//   }
//   if (fs.existsSync(path.join(__dirname, filePath))) {
//     return path.join(__dirname, filePath)
//   }
//   return false
// }

app.listen(3030, () => console.log('Listening on port 3030'))
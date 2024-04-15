const express = require('express')
const app = express()
const port = 3000
const fs = require('fs')
var cors = require('cors')

app.use(cors())
app.listen(port, () => {
  console.log(`tutorial backend started on port ${port}`)
})


app.get('/users', (req, res) => {
  fs.readFile('data/users.json', 'utf8', (err, data) => {
    res.send(data)
  })
})

app.get('/user/:id', (req, res) => {
  fs.readFile('data/users.json', 'utf8', (err, data) => {
    const users = JSON.parse(data)
    var user = users.find(user => user.id === parseInt(req.params.id))
    delete user.created_at
    res.send(user)
  })
})
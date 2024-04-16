const express = require('express')
const app = express()
const port = 3000
const fs = require('fs')
var cors = require('cors')
const yaml = require('js-yaml')

app.use(cors())
app.listen(port, () => {
  console.log(`tutorial backend started on port ${port}`)
})

app.get('/openapi.json', (req, res) => {
  fs.readFile('data/openapi.yml', 'utf8', (err, data) => {
    jsonOpenAPI = yaml.load(data)
    res.setHeader('Content-Type', 'application/json')
    res.send(jsonOpenAPI)
  })
})



app.delete('/user', (req, res) => {
  const userId = parseInt(req.query.id)
  res.setHeader('Content-Type', 'application/json')
  res.status(204)
  res.send(true)
  console.log()
})

app.get('/users', (req, res) => {
  fs.readFile('data/users.json', 'utf8', (err, data) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(data)
  })
})

app.get('/user', (req, res) => {
  fs.readFile('data/users.json', 'utf8', (err, data) => {
    const users = JSON.parse(data)
    var user = users.find(user => user.id === parseInt(req.query.id))
    if (user) {
      user["_links"] = [
        "deleteUser"
      ]
    }
    res.setHeader('Content-Type', 'application/json')
    res.send(user)
  })
})
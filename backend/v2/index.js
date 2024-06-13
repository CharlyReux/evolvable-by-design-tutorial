const express = require('express')
const app = express()
const port = 3000
const fs = require('fs')
var cors = require('cors')
const yaml = require('js-yaml')

const users = [...require('./data/users.json')]


app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  preflightContinue: true
}));


app.options('/openapi.json', (req, res) => {
  console.log("OPTIONS method called")
  fs.readFile('data/openapi.yml', 'utf8', (err, data) => {

    jsonOpenAPI = yaml.load(data)
    const back_url = process.env.CODESPACE_NAME ? `https://${process.env.CODESPACE_NAME}-3000.app.github.dev` : "http://localhost:3000"
    jsonOpenAPI.servers[0].url = back_url
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, content-type");
    res.setHeader('Content-Type', 'application/json')
    res.status(200)
    res.send(jsonOpenAPI)
  })
})
app.listen(port, () => {
  console.log(`tutorial backend started on port ${port}`)
})
app.delete('/user', (req, res) => {
  const userId = parseInt(req.query.id)
  users.splice(users.findIndex(user => user.id === userId), 1)
  res.setHeader('Content-Type', 'application/json')
  res.status(204)
  res.send(true)
})

app.get('/users', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(users)
})

app.get('/user', (req, res) => {

  var user = users.find(user => user.id === parseInt(req.query.id))
  if (user) {
    user["_links"] = [
      "deleteUser"
    ]
    res.setHeader('Content-Type', 'application/json')
    res.send(user)
  }
  else {
    res.setHeader('Content-Type', 'application/json')
    res.status(404)
    res.send({ error: "user not found" })
  }
})
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
    const back_url = process.env.CODESPACE_NAME ? `https://${process.env.CODESPACE_NAME}-3000.app.github.dev` : "http://localhost:3000"

    jsonOpenAPI.servers[0].url = back_url

    res.setHeader('Content-Type', 'application/json')
    res.send(jsonOpenAPI)
  })
})

app.get('/users', (req, res) => {
  fs.readFile('data/users.json', 'utf8', (err, data) => {
    res.send(data)
  })
})

app.get('/users/:id', (req, res) => {
  fs.readFile('data/users.json', 'utf8', (err, data) => {
    const users = JSON.parse(data)
    const user = users.find(user => user.id === parseInt(req.params.id))
    res.send(user)
  })
})
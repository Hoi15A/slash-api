var express = require('express')
var bodyParser = require('body-parser')
var app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// eslint-disable-next-line
var routes = require('./routes/routes.js')(app)

var server = app.listen(3008, function () {
  console.log('Listening on port %s...', server.address().port)
})

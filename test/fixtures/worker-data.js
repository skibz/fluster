
var cluster = require('cluster')

process.on('message', function(message) {
  process.send(false)
})

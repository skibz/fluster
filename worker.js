
process.on('message', function(message) {
  console.log(message)
})

setTimeout(function() {
  process.exit(1)
}, 5000)

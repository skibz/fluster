var os = require('os')

var chai = require('chai')
var expect = chai.expect

var fluster = require('../')

describe('event listeners', function () {

  this.timeout(30000)

  it('should bind all given events for cluster and worker', function(done) {
    var a = false
    fluster({
      cluster: {
        on: {
          fork: function() {
            if (!a) {
              a = true
              return done()
            }
          }
        }
      },
      workers: {
        limit: 1,
        exec: 'test/fixtures/worker-data.js',
        respawn: false,
        // on: {
        //   listening: done.bind(done, null)
        // }
      }
    })
  })

})

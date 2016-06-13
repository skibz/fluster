var os = require('os')

var chai = require('chai')
var expect = chai.expect

var fluster = require('../')

describe('event listeners', function () {

  it('should bind all given events for cluster and worker', function(done) {
    var a = 0;
    fluster({
      cluster: {
        on: {
          fork: function() {
            if (a === 0) {
              a += 1
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

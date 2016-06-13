var os = require('os')

var chai = require('chai')
var expect = chai.expect

var fluster = require('../')

describe('worker data', function () {

  it('should send any keyed data with a value property as soon as a worker boots', function (done) {
    var a = 0;
    fluster({
      workers: {
        limit: 1,
        exec: 'test/fixtures/worker-data.js',
        on: {
          message: function() {
            if (a === 0) {
              a += 1
              return done()
            }
          }
        },
        respawn: false,
        data: {
          testing: {
            value: '1'
          }
        }
      }
    })
  })

  it('should register interval timers if keyed data has an every property', function () {
    var cluster = fluster({
      workers: {
        limit: 1,
        exec: 'test/fixtures/worker-data.js',
        respawn: false,
        data: {
          testing: {
            every: 1000,
            exec: function(send) {}
          }
        }
      }
    })
    expect(cluster.send.testing).to.be.ok
  })

})

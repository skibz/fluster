var os = require('os')

var chai = require('chai')
var expect = chai.expect

var fluster = require('../')

describe('defaults', function() {

  this.timeout(30000)

  it('should create as many workers as there are cpu cores', function() {
    expect(Object.keys(
      fluster({
        workers: {
          exec: 'test/fixtures/worker-shortlived.js',
          respawn: false
        }
      }).cluster.workers
    ).length).to.equal(
      os.cpus().length
    )
  })

  it('should respawn workers when they exit', function(done) {
    var started = 0;
    fluster({
      cluster: {
        on: {
          fork: function() {
            started += 1
            if (started === 2) return done()
          }
        }
      },
      workers: {
        limit: 1,
        exec: 'test/fixtures/worker-shortlived.js'
      }
    })
  })

  it('should default to process.env', function() {
    expect(fluster({
      workers: {
        limit: 1,
        exec: 'test/fixtures/worker-shortlived.js',
        respawn: false
      }
    }).env).to.deep.equal(process.env)
  })

  it('should default to cluster default scheduling policy', function() {
    var cluster = fluster({
      workers: {
        limit: 1,
        exec: 'test/fixtures/worker-shortlived.js',
        respawn: false
      }
    })
    expect(cluster.cluster.schedulingPolicy).to.equal(cluster.cluster.SCHED_RR)
  })

})


var fluster = require('./index')

fluster({
  cluster: {
    on: {
      // todo: bind `this` to cluster
      online: function(worker) {
        console.log('worker', worker.id, 'is online')
      },
      setup: function() {
        console.log('cluster has been set up')
      }
    }
  },
  workers: {
    limit: 3, // remove this to use a process per core
    exec: 'worker.js',
    on: {
      // todo: bind `this` to worker
      exit: function() {}
    },
    data: {
      somedata: {
        value: 'abcdefg'
      },
      foo: {
        every: 1000,
        exec: function(send) {
          send({heyo: 'abc'})
        }
      },
      // todo: support readable streams
      // todo: test event emitter code
      // baz: {
      //   on: {
      //     data: function(data, send) {
      //       frobnicate(data, send)
      //     },
      //     of: bazemitter
      //   }
      // }
    }
  }
})


var fluster = require('./index')

fluster({
  cluster: {
    on: {
      online: function(worker) {
        console.log('worker', worker.id, 'is online')
      },
      setup: function() {
        console.log('cluster has been set up')
      }
    }
  },
  workers: {
    limit: 3,
    exec: 'worker.js',
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

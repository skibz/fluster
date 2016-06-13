
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
          this.value = 'abc' // saves the value - so if a worker crashes, it
                             // can be sent this immediately once it has been restarted
          send({heyo: 'abc'})
        }
      },
      // todo: support readable streams (piping to writable stream)
      // todo: test event emitter code
      // todo: think of a way to support backing up data for worker
      // failures with readable streams and event emitters
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

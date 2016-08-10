
# fluster

a simple wrapper for node's cluster module
schedule any number of threads and seed them with data via ipc at boot or at intervals

##### example

```javascript
var fluster = require('fluster')
var mycluster = fluster({
  cluster: {
    // bind arbitrary cluster events
    on: {
      // message
      // online
      // exit
      // disconnect
      // fork
      // setup
      // listening
    }
  },
  workers: {
    // select a script to run in many threads
    exec: 'my-worker.js',
    // workers respawn with values from `workers.data` by default
    respawn: false,
    // omit `workers.limit` to scale to your cpu core count
    limit: 5,
    data: { // each key in this object will trigger a process#onmessage event in your worker
      somedata: {
        value: [1, 2, 3, 4, 5, 6]
      },
      someotherdata: {
        every: 1000 * 60 * 60,
        exec: function(send) {
          businesslogic(function(err, res) {
            // store the value for posterity
            this.value = res || this.value
            send(err, res)
          }.bind(this))
        }
      }
    },
    // bind arbitrary worker events
    on: {
      // message
      // online
      // exit
      // disconnect
      // fork
      // error
      // listening
    }
  }
})
```

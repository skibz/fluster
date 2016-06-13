
# fluster

##### example

```javascript
var fluster = require('fluster')
var mycluster = fluster({
  cluster: {
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
    exec: 'my-worker.js',
    respawn: false, // workers respawn with values from `workers.data` by default
    limit: 5, // omit to scale to your cpu core count
    data: {
      // seed your workers with data at
      // bootstrap (or on a schedule) via ipc
      somedata: {
        value: [1, 2, 3, 4, 5, 6]
      },
      someotherdata: {
        every: 1000 * 60 * 60,
        exec: function(send) {
          businesslogic(function(err, res) {
            this.value = res // store the value for posterity
            send(err, res)
          }.bind(this))
        }
      }
    },
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

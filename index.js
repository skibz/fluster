
'use strict';

var os = require('os')

function clustersend(message) {
  Object.keys(this.workers).forEach(function(id) {
    this.workers[id].send(message);
  }, this);
}

function clusterbackups() {
  return Object.keys(
    this.send
  ).map(function(send) {
    var value = {};
    value[send] = this.send[send].value || null
    return value
  }, this)
}

module.exports = function (opts) {
  if (typeof opts !== 'object') throw 'args error'

  var fluster = {
    send: {}
  }

  opts.cluster = opts.cluster || {}
  opts.workers = opts.workers || {}

  var cluster = require('cluster')
  var send = clustersend.bind(cluster)
  var backups = clusterbackups.bind(fluster)

  cluster.schedulingPolicy = opts.cluster.schedulingPolicy || cluster.schedulingPolicy
  fluster.env = opts.cluster.env || process.env

  if (!opts.workers.exec) throw 'missing worker script'

  cluster.setupMaster({
    exec: opts.workers.exec
  })

  if (opts.workers.respawn === false) {

  } else {
    cluster.on('exit', function (worker, code, signal) {
      cluster.fork(fluster.env).send(backups())
    })
  }

  var clusterevents = Object.keys(opts.cluster.on || {})
  for (var clusterevent in clusterevents) {
    cluster.on(
      clusterevents[clusterevent],
      opts.cluster.on[clusterevents[clusterevent]]
    )
  }

  var workerdata = Object.keys(opts.workers.data || {})
  for (var workerdatum in workerdata) {
    var currentworkerdata = opts.workers.data[workerdata[workerdatum]]

    // todo: determine if readable stream and pause until workers ready
    if (currentworkerdata.on) {
      var workerdataevents = Object.keys(currentworkerdata.on)
      var ofindex = workerdataevents.indexOf('of')
      if (ofindex === -1) throw 'missing of arg'
      workerdataevents.splice(ofindex, 1)
      for (var workerdataevent in workerdataevents) {
        var workerdatacallback = currentworkerdata.on[workerdataevents[workerdataevent]]
        currentworkerdata.of.on(
          workerdataevents[workerdataevent],
          function() {
            workerdatacallback.apply(workerdatacallback, arguments.concat[send])
          }
        )
      }
      continue
    }

    fluster.send[workerdata[workerdatum]] = {}

    if (currentworkerdata.every) {
      fluster.send[workerdata[workerdatum]].cleartimer = setInterval(
        currentworkerdata.exec.bind(
          fluster.send[workerdata[workerdatum]],
          send
        ),
        currentworkerdata.every
      )
      continue
    }

    if (!currentworkerdata.every) {
      if (currentworkerdata.exec) {
        // requiring the caller to mutate `this.value` here is so lame
        currentworkerdata.exec.call(fluster.send[workerdata[workerdatum]])
      } else {
        fluster.send[workerdata[workerdatum]].value = currentworkerdata.value
      }
      continue
    }
  }

  if (opts.workers.limit !== 'auto' && !opts.workers.limit) {
    os.cpus().forEach(cluster.fork.bind(cluster, fluster.env))
  } else {
    for (var i = 0, limit = opts.workers.limit; i < limit; i++) {
      cluster.fork(fluster.env)
    }
  }

  var workerevents = Object.keys(opts.workers.on || {})
  Object.keys(cluster.workers).forEach(function(id) {
    for (var workerevent in workerevents) {
      cluster.workers[id].on(
        workerevents[workerevent],
        opts.workers.on[workerevents[workerevent]]
      )
    }
  })

  if (Object.keys(fluster.send).length) send(backups())

  fluster.cluster = cluster;

  return fluster
}

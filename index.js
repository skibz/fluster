
'use strict';

var os = require('os')
var stream = require('stream')
var events = require('events')

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

  cluster.setupMaster({exec: opts.workers.exec})

  if (opts.workers.respawn !== false) {
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
    var e = currentworkerdata.of
    if (e && currentworkerdata.on) {
      if (typeof e === 'function') {
        e = e()
      }

      if (!(e instanceof events.EventEmitter)) {
        throw 'non eventemitter value given'
      }

      var eventkeys = Object.keys(currentworkerdata.on)
      for (var event in eventkeys) {
        e.on(eventkeys[event], function() {
          // call the given function and send the result to all workers
          var message = {}
          message[workerdata[workerdatum]] = currentworkerdata.on[eventkeys[event]].apply(
            currentworkerdata.on[eventkeys[event]],
            arguments
          )
          send(message)
        })
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

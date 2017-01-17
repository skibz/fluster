
'use strict'

var os = require('os')
var stream = require('stream')
var events = require('events')

function clustersend(message) {
  Object.keys(
    this.workers
  ).forEach(function(id) {
    this.workers[id].send(message)
  }, this)
}

function clusterbackups() {
  return Object.keys(
    this.send
  ).map(function(send) {
    var value = {}
    value[send] = this.send[send].value || null
    return value
  }, this)
}

module.exports = function(opts) {

  var optstype = typeof opts
  if (optstype !== 'object') {
    throw new Error(
      'expected object type `opts` but got ' +
      optstype
    )
  }

  var cluster = require('cluster')
  var fluster = {send: {}}

  var send = clustersend.bind(cluster)
  var backups = clusterbackups.bind(fluster)

  opts.cluster = opts.cluster || {}
  opts.workers = opts.workers || {}

  cluster.schedulingPolicy = opts.cluster.schedulingPolicy || cluster.schedulingPolicy
  fluster.env = opts.cluster.env || process.env

  var exectype = typeof opts.workers.exec
  if (exectype !== 'string') {
    throw new Error(
      'expected string type `opts.workers.exec`, but got ' +
      typeof opts.workers.exec
    )
  }

  cluster.setupMaster({exec: opts.workers.exec})

  if (opts.workers.respawn !== false) {
    cluster.on('exit', function (worker, code, signal) {
      cluster.fork(fluster.env).send(backups())
    })
  }

  Object.keys(opts.cluster.on || {}).forEach(function(event) {
    cluster.on(event, opts.cluster.on[event])
  })

  Object.keys(opts.workers.data || {}).forEach(function(d) {
    var currentdata = opts.workers.data[d]
    var e = currentdata.of
    if (e && currentdata.on) {
      if (typeof e === 'function') e = e()
      if (!(e instanceof events.EventEmitter)) {
        throw new Error('expected an EventEmitter')
      }
      Object.keys(currentdata.on).forEach(function(event) {
        e.on(currentdata.on[event], function() {
          var msg = {}
          msg[d] = currentdata.on[event].apply(
            currentdata.on[event],
            [e].concat([].slice.call(arguments))
          )
          send(msg)
        })
      })
      return
    }

    fluster.send[d] = {}

    if (currentdata.every) {
      fluster.send[d].cleartimer = setInterval(
        currentdata.exec.bind(
          fluster.send[d],
          send
        ),
        currentdata.every
      )
      return
    }
    if (currentdata.exec) {
      currentdata.exec.call(fluster.send[d])
    } else {
      fluster.send[d].value = currentdata.value
    }
  })

  if (opts.workers.limit !== 'auto' && !opts.workers.limit) {
    os.cpus().forEach(cluster.fork.bind(cluster, fluster.env))
  } else {
    for (var i = 0, limit = opts.workers.limit; i < limit; i++) {
      cluster.fork(fluster.env)
    }
  }

  Object.keys(cluster.workers).forEach(function(id) {
    Object.keys(opts.workers.on || {}).forEach(function(event) {
      cluster.workers[id].on(event, opts.workers.on[event])
    })
  })

  if (Object.keys(fluster.send).length) send(backups())

  fluster.cluster = cluster;

  return fluster
}

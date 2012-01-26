#!/usr/bin/env node

var cluster = require('cluster');

if (cluster.isMaster) {
  var program = require('commander');

  program
    .version('0.0.1')
    .option('-w, --workers [workers]', 'Number of workers', parseInt)
    .option('-s, --stats', 'Show cluster stats (localhost:8444)')
    .parse(process.argv);

  var Jetpack = function(opts) {
    opts = opts || {};
    this.options = {
      workers: parseInt(opts.workers) || require('os').cpus().length
    , path: process.cwd() + '/' + opts.path
    };

    if (opts.stats) this.startStatsServer();

    this.workerDeaths = 0;
    this.workerSuicides = 0;
    this.workers = [];

    this.numReqs = 0;
    var self = this;

    process.on('exit', function() {
      console.log('Jetpack is exiting')
      self.workers.forEach(function(worker) {
        worker.destroy();
      })
    });

    cluster.on('death', function(worker) {
      if (worker.suicide) {
        self.workerSuicides++;
        console.log('worker %d committed suicide', worker.process.pid);
        if (self.workerSuicides >= self.options.workers) {
          console.log('all workers have committed suicide, JetPack is shutting down.')
          process.exit();
        }

      } else {
        self.workerDeaths++;
        console.log('worker %d died', worker.process.pid);
        if (self.workerDeaths < 10) {
          var newWorker = self.spawnWorker();
          console.log('worker %d replaced %d', newWorker.process.pid, worker.process.pid);
        } else {
          console.log('10 worker deaths have occurred, JetPack is shutting down.')
          process.exit();
        }
      }
    });
  }


  Jetpack.prototype.start = function() {
    for (var i = 0; i < this.options.workers; i++) {
      this.spawnWorker();
    }
  }


  Jetpack.prototype.startStatsServer = function() {
    var http = require('http');

    var self = this;
    http.Server(function(req, res) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write('<h3>Requests Handled</h3>');
      res.write('<pre>')
      res.write('Total        '+self.numReqs+'\n');
      self.workers.forEach(function(worker) {
        res.write('Worker '+worker.process.pid+'  '+worker.numReqs+'\n');
      });
      res.end('</pre>')
    }).listen(8444);
    console.log('Stats available at http://localhost:8444')
  }


  Jetpack.prototype.spawnWorker = function() {
    var opts = { port: this.options.port, path: this.options.path };
    var worker = cluster.fork();
    worker.numReqs = 0;
    worker.on('message', this._handleMessage());
    worker.on('online', function(w) { w.send({cmd: 'start', opts: opts}); });
    this.workers.push(worker);
    setInterval(function() {worker.send({cmd: 'keepalive'})}, 1000);
    return worker;
  }
  

  Jetpack.prototype._handleMessage = function() {
    var self = this;
    return function(msg) {
      if (msg && msg.cmd == 'notifyRequest') {
        this.numReqs++;
        self.numReqs++;
      }
    }
  }


  var jetpack = new Jetpack({
    workers: program.workers
  , path:    program.args[0]
  , stats:   program.stats
  }).start();




} else { // cluster.isWorker
  var Worker = function() {
    this.destroyAfter(5000);
  };

  Worker.prototype.start = function(opts) {
    opts = opts || {};
    
    if (!opts.path) throw new Error('Server path not specified.');
    this.server = require(opts.path);

    console.log('Worker %d started', process.pid);
  }

  Worker.prototype.destroyAfter = function(ms) {
    this.destroyTimeout = setTimeout(function() {
      cluster.worker.destroy();
    }, ms);
  }

  Worker.prototype.keepalive = function(opts) {
    clearTimeout(this.destroyTimeout);
    this.destroyAfter(3000);
  }


  var worker = new Worker();

  process.on('message', function(msg) {
    if (msg && msg.cmd) worker[msg.cmd].call(worker, msg.opts);
  });
}
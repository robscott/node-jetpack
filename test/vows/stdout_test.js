var vows    = require('vows')
  , assert  = require('assert')
  , request = require('request')
  , helpers = require('../lib/helpers')
  , numCpus = require('os').cpus().length
  , spawn   = require('child_process').spawn
  , s1, s2;

vows.describe('Stdout').addBatch({
  'bin/jetpack.js test/servers/hello_world_stdout.js': {
    topic: function() {
      s1 = spawn('./bin/jetpack.js', ['test/servers/hello_world_stdout.js']);
      helpers.callbackWithStdout(s1, {wait: 2000}, this.callback);
    }

  , 'should stdout "Hello World" numCpus times (default # of workers)': function(text) {
      helpers.matches(text, 'Hello World', numCpus);
    }
  }

, 'bin/jetpack.js test/servers/hello_world_stdout.js -w 5': {
    topic: function() {
      s2 = spawn('./bin/jetpack.js', ['test/servers/hello_world_stdout.js', '-w', '5']);
      helpers.callbackWithStdout(s2, {wait: 2000}, this.callback);
    }

  , 'should stdout "Hello World" 5 times (# of workers)': function(text) {
      helpers.matches(text, 'Hello World', 5);
    }
  }
}).export(module, {error: false});
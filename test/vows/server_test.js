var vows    = require('vows')
  , assert  = require('assert')
  , request = require('request')
  , spawn   = require('child_process').spawn;

var s1 = spawn('./bin/jetpack.js', ['test/servers/basic_server.js'])
vows.describe('Server').addBatch({
  'bin/jetpack.js test/servers/basic_server.js': {
    topic: function() {
      s1.stdout.on('data', function (data) { console.log('s1 stdout: ' + data); });
      s1.stderr.on('data', function (data) { console.log('s1 stderr: ' + data); });
      return true;
    }

  , 'GET http://localhost:3000': {
      topic: function() {
        request.get({url: 'http://localhost:3000'}, this.callback)
      }
      
    , 'should respond with 200': function(req, res, body) {
        assert.equal(res.statusCode, 200);
      }

    , 'body should be "hello world"': function(req, res, body) {
        assert.equal(body, "hello world\n");
      }
    
    , 'shutdown server': function() {
        s1.stdin.end();
      }
    }
  }
}).export(module, {error: false});
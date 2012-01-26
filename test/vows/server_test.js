var vows    = require('vows')
  , assert  = require('assert')
  , request = require('request')
  , spawn   = require('child_process').spawn;

var s1 = spawn('./bin/jetpack.js', ['test/servers/hello_world_4592.js'])
vows.describe('Server').addBatch({
  'bin/jetpack.js test/servers/hello_world_4592.js': {
    topic: function() {
      setTimeout(this.callback, 500);
    }

  , '> GET http://localhost:4592': {
      topic: function() {
        request.get({url: 'http://localhost:4592'}, this.callback)
      }
      
    , 'should respond with 200': function(req, res, body) {
        assert.equal(res.statusCode, 200);
      }

    , 'body should be "Hello World"': function(req, res, body) {
        assert.equal(body, "Hello World\n");
      }
    
    , 'shutdown server': function() {
        s1.kill();
      }
    }
  }
}).export(module, {error: false});
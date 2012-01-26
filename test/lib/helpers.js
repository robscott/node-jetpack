var assert = require('assert');

var helpers = module.exports = {
  callbackWithStdout: function(spawn, opts, callback) {
    opts = opts || {};
    var text = '';
    
    spawn.stdout.on('data', function(data) { text += data; });
    spawn.stderr.on('data', function(data) { console.error('stderr: '+data) });

    setTimeout(function() {
      spawn.kill();
      callback(text);
    }, (parseInt(opts.wait) || 2000));
  }

, matches: function(text, string, matchesExpected) {
    var matches = text.match(new RegExp(string, 'g'));
    assert.isArray(matches);
    assert.equal(matches.length, matchesExpected);
  }
}
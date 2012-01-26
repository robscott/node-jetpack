var http = require('http');

module.exports = http.Server(function(req, res) {
  setTimeout(function() {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World\n');

    process.send({cmd: 'notifyRequest'})
  }, 500)
}).listen(3000);
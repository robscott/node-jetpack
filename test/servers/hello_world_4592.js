var http = require('http');

module.exports = http.Server(function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');

  process.send({cmd: 'notifyRequest'})
}).listen(4592);
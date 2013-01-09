var http = require('http'),
  url = require('url'),
  userSession = false,
  logger = require('logger').createLogger(__dirname + '/history'),
  iptables = require('iptables'),
  denied = require('./denied');

var rules = [
  {
    protocol: 'tcp',
    dport: 80,
    chain: 'OUTPUT'
  },
  {
    protocol: 'tcp',
    dport: 443,
    chain: 'OUTPUT'
  }
];

function ports(act) {
  if (act === 'close') {
    rules.forEach(function (r) {
      iptables.drop(r);
    })
  }

  if (act === 'open') {
    iptables.execArgString('-F');

  }

}

function log(req) {
  console.log(req.connection.remoteAddress + ": " + req.method + " " + req.url);
}

function proxify(req, res) {
  var opts = {hostname: req.headers['host'], method: req.method, headers: req.headers, path: url.parse(req.url).path},
    proxy = http.request(opts, function (proxy_res) {

      proxy_res.on('data', function(chunk) {
        res.write(chunk, 'binary');
      }).on('end', function() {
        res.end();
      });
    
      res.writeHead(proxy_res.statusCode, proxy_res.headers);

    });



  req.on('data', function(chunk) {
    proxy.write(chunk, 'binary');
  }).on('end', function() {
    proxy.end();
  });

 logger.info(req.connection.remoteAddress + ": " + req.method + " " + req.url)

}

exports.getUserSession = function () {
  return userSession;
}

exports.switchOn = function ()  {
  userSession = true;
  ports('open');

}

exports.switchOff = function () {
  userSession = false;
  ports('close');
}


exports.init = function () {

  ports('close');

  http.createServer(function(req, res) {
    


    if (!userSession)  {
      return res.end(denied);
    }
    
    

    proxify(req, res);

  }).listen(9000)

}
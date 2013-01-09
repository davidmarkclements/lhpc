var express = require('express'),
  http = require('http'),
  transProxy =  require('./transProxy'),
  admin = require('./admin'),
  logger = require('logger').createLogger('sessions'),
  fs = require('fs');



transProxy.init('lighthousehostel.org');

var app = express()

  .use(express.bodyParser())

  
  .get('/', function (req, res, next) {
    if (transProxy.getUserSession()) {
      res.end('Session In Progress');
      return;
    }

    next();
  })

  .use(express.static('mod'))

  .post('/', function (req, res) {
    var staffname = req.body.staffname;

    if (transProxy.getUserSession()) {
      res.end('Session In Progress');
      return;
    }

    if (!admin.staff.hasOwnProperty(staffname)) {
      res.end('No such staff member');
      return;
    }

    admin.chkpw(staffname, req.body.pw, function (err, passed) {
      if (err) return res.end('crypto error');
      if (!passed) {
        res.end('incorrect password');
        return;
      }
      // swtich on request was a success, switch her on
      transProxy.switchOn();

      setTimeout(transProxy.switchOff, req.body.time * 60000);
      res.end(req.body.staffname + ' enabled internet for ' + req.body.clientname + 'for duration of ' + req.body.time + ' minutes');      
      logger.info('Staff: ' + staffname, 'Client: ' + req.body.clientname, 'Time: ' + req.body.time + ' minutes')

    }, admin.staff[staffname]);


  })

  .get('/staff', function (req, res) {
    res.end(JSON.stringify(Object.keys(admin.staff)));
  })


  .get('/admin', express.basicAuth(admin.chkpw), function (req, res) {
    res.sendfile('admin.html');
  })


  .get('/admin/logs/:log', express.basicAuth(admin.chkpw), function (req, res) {
    res.sendfile(req.params.log);
  })


  .post('/admin/:action', express.basicAuth(admin.chkpw), function (req, res) {
    admin.actions[req.params.action](req,res);
  });
    

http.createServer(app).listen(3000);
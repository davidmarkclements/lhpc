var fs = require('fs'),
  adpw = require('./adpw.js'),
  staff = require('./staff.js'),
  crypto = require('crypto');



function genpw(pw, cb) {

  crypto.pbkdf2(pw, 'saltysalt', 4, 10, cb);

}


function changeadpw (newpw, done) {

  genpw(newpw, function (err, hash) {
    if (err) return done(err);

    newpw = hash;


    fs.writeFile('adpw.js', 'module.exports = "'+newpw+'";', function (err) {      
      if (err) return done(err);      
      adpw = newpw;
      done();
    });

  });


}


exports.chkpw = function (un, pw, passed, pwchk) {

  pwchk = pwchk || adpw;

  genpw(pw, function (err, pw) {
    passed(err, pw === pwchk);

  });


}
exports.genpw = genpw;
exports.staff = staff;

exports.actions = {
  changeadpw : function(req, res) {
      changeadpw(req.body.newpw, function (err) {
        if (err) return res.end('Error!', err)

        res.end('password changed');

      });

  },
  addstaff: function (req, res, next) {
    genpw(req.body.staffpw, function (err, hash) {
      if (err) return next(err);

      staff[req.body.staffname] = hash;

      fs.writeFile('./staff.js', 'module.exports = ' + JSON.stringify(staff), function (err) {
        if (err) return next(err);

        res.end('staff added/updated');
      });
      

    });


  },
  removestaff: function (req, res) {
    if (!staff.hasOwnProperty(req.body.staffname)){

      return res.end('staff member not found, please ensure name is spelt correctly with correct capitalization etc.')
    } 


    delete staff[req.body.staffname];

    fs.writeFile('./staff.js', 'module.exports = ' + JSON.stringify(staff), function (err) {
      if (err) return next(err);

      res.end('staff removed');
    });






  }


}
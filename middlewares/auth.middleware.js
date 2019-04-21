const passport = require('passport');

module.exports.ensureAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    next();
  }
  else {
    req.flash("info", "You must login to view this page");
    res.redirect('/signin');
  }
}

module.exports.jwtAuth = passport.authenticate('jwt', {session: false})

module.exports.ensureForApiAuthenticated = [
  this.ensureAuthenticated,
  this.jwtAuth
];
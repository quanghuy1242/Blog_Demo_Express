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
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

let User = require('./models/user.model');

passport.use("login", new LocalStrategy(function(username, password, done) {
  User.findOne({ username: username }, function(err, user) {
    if (err) { return done(err); }
    if (!user) {
      return done(null, false, { message: "No user has that username!" });
    }
    user.checkPassword(password, (err, isMatch) => {
      if (err) { return done(err); }
      if (isMatch) {
        return done(null, user, { message: "Sucessfully!" });
      }
      else {
        return done(null, false, { message: "Invalid Password!" })
      }
    });
  });
}));

module.exports = function() {
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};
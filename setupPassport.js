const passport = require('passport');
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const LocalStrategy = require('passport-local').Strategy;
const dotenv = require('dotenv');
dotenv.config();

let User = require('./models/user.model');

passport.use("login", new LocalStrategy({ session: false }, function(username, password, done) {
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

passport.use(new JWTStrategy({ 
  jwtFromRequest: req => req.cookies.jwt, 
  secretOrKey: process.env.JWT_SECRET 
}, (payload, done) => {
  if (Date.now() > payload.expires) {
    return done(null, false, { message: "JWT Expired!" });
  }
  return done(null, payload);
}))

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
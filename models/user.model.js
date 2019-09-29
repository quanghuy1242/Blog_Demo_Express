const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const SALT_FACTOR = 10;

let userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createAt: { type: Date, default: Date.now },
  displayName: String,
  bio: String,
  role: String,
  latestSignIn: { type: Date }
});

userSchema.methods.name = function() {
  return this.displayName || this.username;
};

userSchema.pre("save", function(done) {
  let user = this;
  if (!user.isModified("password")) {
    return done();
  }
  bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
    if (err) { return done(err); }
    bcrypt.hash(user.password, salt, () => {}, function(err, hashPassword) {
      if (err) { return done(err); }
      user.password = hashPassword;
      done();
    })
  })
});

userSchema.methods.checkPassword = function(password, done) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    done(err, isMatch);
  })
}

let User = mongoose.model("User", userSchema);
module.exports = User;
const express = require('express');
const passport = require('passport');

const User = require('../models/user.model');

const authenticate = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', function(req, res, next) {
  User.find()
    .sort({ createAt: "descending" })
    .exec(function(err, users) {
      if (err) return next(err);
      res.render('index', {
        users: users,
        title: 'Homepage'
      });
    })
});

router.get('/signin', function(req, res, next) {
  res.render('signin', {
    title: "Sign in"
  })
});

router.post('/signin', passport.authenticate('login', {
  successRedirect: '/',
  failureRedirect: '/signin',
  failureFlash: true
}));

router.get('/logout', function(req, res) {
  req.logOut();
  res.redirect('/');
});

router.get('/signup', function(req, res) {
  res.render('signup', {
    title: "Sign up"
  });
});

router.post('/signup', function(req, res, next) {
  let username = req.body.username;
  let password = req.body.password;

  User.findOne({ username: username }, function(err, user) {
    if (err) { return next(err); }

    if (user) {
      req.flash('error', 'User already exist!');
      return res.redirect('/signup');
    }
    
    let newUser = new User({
      username: username,
      password: password
    });
    newUser.save(next);
  });
}, passport.authenticate("login", {
  successRedirect: '/',
  failureRedirect: '/signup',
  failureFlash: true
}));

router.get('/edit', authenticate.ensureAuthenticated, function (req, res, next) {
  res.render('edit', {
    title: 'Edit your infomation'
  })
});

router.post('/edit',authenticate.ensureAuthenticated, function (req, res, next) {

})

module.exports = router;
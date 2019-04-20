const express = require('express');
const passport = require('passport');
const moment = require('moment-timezone');

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
  let { username, password } = req.body;

  if (username.length < 5) {
    req.flash('error', 'Tên đăng nhập phải có ít nhất 5 kí tự');
    return res.render('signup', {
      title: 'Sign up',
      errorInfo: { username, password }
    });
  }

  if (!/((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])).{6,}/m.test(password)) {
    req.flash('error', 'Mật khẩu phải có tối thiểu 6 kí tự bao gồm 1 kí tự hoa, 1 kí tự số, 1 kí tự thường');
    return res.render('signup', {
      title: 'Sign up',
      errorInfo: { username, password }
    });
  }

  User.findOne({ username: username }, function(err, user) {
    if (err) { return next(err); }

    if (user) {
      req.flash('error', 'User already exist!');
      return res.render('signup', {
        title: 'Sign up',
        errorInfo: { username, password }
      });
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

router.get('/setting', authenticate.ensureAuthenticated, (req, res, next) => {
  res.render('setting', {
    title: 'Setting'
  })
})

router.get('/edit', authenticate.ensureAuthenticated, function (req, res, next) {
  res.render('edit', {
    title: 'Edit your infomation'
  })
});

router.post('/edit', authenticate.ensureAuthenticated, function (req, res, next) {
  req.user.displayName = req.body.displayName;
  req.user.bio = req.body.bio;
  req.user.username = req.body.username;
  req.user.save((err) => {
    if (err) { next(err); return; }
    req.flash("info", "Thông tin được update!");
    res.redirect('/');
  });
})

router.get('/change-password', authenticate.ensureAuthenticated, (req, res, next) => {
  res.render('resetpass', {
    title: 'Change your password'
  })
})

router.post('/change-password', authenticate.ensureAuthenticated, (req, res, next) => {
  req.user.checkPassword(req.body.oldPassword, (err, isMatch) => {
    if (err) return next(err);
    if (!isMatch) {
      req.flash("error", "Mật khẩu không khớp!");
      return res.redirect('/change-password');
    } else {
      req.user.password = req.body.newPassword;
      req.user.save((err) => {
        if (err) { next(err); return; }
        req.flash("info", "Mật khẩu được update!");
        res.redirect('/');
      });
    }
  })
})

router.get('/timezone', (req, res, next) => {
  res.json({ timezone: moment.tz.guess() })
})

module.exports = router;
const express = require('express');
const passport = require('passport');
const moment = require('moment-timezone');
const jwt = require('jsonwebtoken');
const ModifiedPost = require('../util/ModifiedPost');

const Blog = require('../models/blog.model');
const Category = require('../models/category.model');
const User = require('../models/user.model');

const authenticate = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', async function(req, res, next) {
  try {
    let pinBlogs = await Blog.find({ isPin: true }).populate('user').populate('category');
    let blogs = await Blog.find()
      .where('isPublic')
      .ne(false)
      .limit(2)
      .sort({ dateCreated: 'descending' })
      .populate('user')
      .populate('category');

    let categories = await Category.find().sort({ name: 'ascending' }).limit(4);
    
    ModifiedPost.addProperties([...pinBlogs, ...blogs]);

    res.render('index', {
      blogs: [...pinBlogs, ...blogs],
      categories: categories,
      title: 'Learn about me - Homepage'
    })
  } catch (err) {
    next(err)
  }
});

router.get('/signin', function(req, res, next) {
  if (req.user) { return res.redirect('/'); }
  res.render('signin', {
    title: "Sign in"
  })
});

router.post('/signin', passport.authenticate('login', {
  failureRedirect: '/signin',
  failureFlash: true
}), (req, res, next) => {
  const payload = {
    username: req.user.username,
    id: req.user._id,
    role: req.user.role,
    expires: Date.now() + parseInt(process.env.JWT_EXPIRATION)
  };
  const token = jwt.sign(JSON.stringify(payload), process.env.JWT_SECRET);
  res.cookie('jwt', token);
  res.redirect('/');
});

router.get('/logout', function(req, res) {
  res.clearCookie('jwt');
  req.logOut();
  res.redirect('/');
});

router.get('/signup', function(req, res) {
  if (req.user) { return res.redirect('/'); }
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
  res.redirect('/signin')
});

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
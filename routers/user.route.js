const express = require('express');
const moment = require('moment');

const User = require('../models/user.model');
const Blog = require('../models/blog.model');

const ModifiedPost = require('../util/ModifiedPost');

const router = express.Router();

router.get('/', (req, res, next) => {
  User.find()
    .sort({ createAt: "descending" })
    .exec(function(err, users) {
      if (err) return next(err);
      res.render('user/index', {
        users: users,
        title: 'Users'
      });
    })
})

router.get('/:username', function (req, res, next) {
  User.findOne({ username: req.params.username }, function(err, user) {
    if (err) { return next(err); }
    if (!user) { return next(404); }
    Blog
      .find({ user: { _id: user._id } })
      .where('isPublic')
      .ne(false)
      .limit(5)
      .sort({ dateCreated: "descending" })
      .populate('user')
      .populate('category')
      .exec((err, blogs) => {
        ModifiedPost.addProperties(blogs);
        res.render("profile", {
          blogs: blogs,
          user: user,
          title: user.name(),
          date: moment(user.createAt).format("DD/MM/YYYY"),
          ...user.latestSignIn && { latestSignIn: moment(user.latestSignIn).format("DD/MM/YYYY") }
        })
      })
  })
});

module.exports = router;
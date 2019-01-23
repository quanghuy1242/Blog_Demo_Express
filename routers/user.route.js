const express = require('express');
const moment = require('moment');

const User = require('../models/user.model');

const router = express.Router();

router.get('/:username', function (req, res, next) {
  User.findOne({ username: req.params.username }, function(err, user) {
    if (err) { return next(err); }
    if (!user) { return next(404); }
    res.render("profile", {
      user: user,
      title: user.name(),
      date: moment(user.createAt).format("DD/MM/YYYY")
    })
  })
});

module.exports = router;
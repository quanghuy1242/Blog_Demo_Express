const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const User = require('../models/user.model');

router.get('/confirmation', (req, res, next) => {
  
});

router.get('/send', (req, res, next) => {
  User.findOne({ _id: res.locals.currentUser._id }, (err, user) => {
    if (err) { return res.render("cailonquedizay") }
  });
});

module.exports = router;
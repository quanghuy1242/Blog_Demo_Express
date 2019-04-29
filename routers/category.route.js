const express = require('express');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ModifiedPost = require('../util/ModifiedPost');

const router = express.Router();

const Blog = require('../models/blog.model');
const Category = require('../models/category.model');

router.get('/:nameId', (req, res, next) => {
  const { nameId } = req.params;
  Category.findOne({ nameId: nameId }).exec((err, category) => {
    if (err || !category) { return next(err); }
    Blog
      .find({ category: category._id })
      .where('isPublic')
      .ne(false)
      .sort({ dateCreated: "descending" })
      .populate('user')
      .populate('category')
      .exec((err, blogs) => {
        if (err) { return next(err); }
        ModifiedPost.addProperties(blogs);
        res.render('category/category', {
          title: `Category: ${category.name}`,
          category: category,
          blogs: blogs
        })
      })
  })
});

module.exports = router;
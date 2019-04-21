const express = require('express');
const Category = require('../models/category.model');
const passport = require('passport');
const authenticate = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', authenticate.ensureForApiAuthenticated, (req, res, next) => {
  res.status(200).json({ info: 'Xin chào cả nhà yêu' });
})

router.get('/categories', (req, res, next) => {
  Category
    .find()
    .sort({ name: 'ascending' })
    .exec((err, categories) => {
      if (err) { res.status(400).json({ msg: 'Error' }) }
      res.status(200).json({ categories: categories })
    })
})

router.post('/category', authenticate.ensureForApiAuthenticated, (req, res, next) => {
  const { nameId, name, urlImage, description } = req.body;
  if (!nameId || !name || !urlImage || !description) {
    res.status(400).json({ msg: 'Không bỏ trống dữ liệu nào!' });
  } else {
    let newCategory = new Category({
      nameId: nameId,
      name: name,
      urlImage: urlImage,
      description: description
    })
    newCategory.save();
    res.status(200).json({ msg: 'Thành công' });
  }
})

router.get('/category/:nameId', (req, res, next) => {
  const { nameId } = req.params;
  Category
    .findOne({ nameId: nameId })
    .exec((err, category) => {
      if (err) { res.status(400).json({ msg: 'Có lỗi!' }); }
      if (!category) {
        res.status(400).json({ msg: 'Có lỗi!' });
      } else {
        res.status(200).json({ category: category });
      }
    })
});

router.put('/category/:nameId', authenticate.ensureForApiAuthenticated, (req, res, next) => {
  const { nameId } = req.params;
  const { name, urlImage, description } = req.body;
  if (!name || !urlImage || !description) {
    res.status(400).json({ msg: 'Có lỗi!' });
  } else {
    Category.findOneAndUpdate(
      { nameId: nameId },
      { $set: { name: name, urlImage: urlImage, description: description } },
      (err, doc, ress) => {
        if (err) { res.status(400).json({ msg: 'Có lỗi!' }); }
        else {
          res.status(200).json({ msg: 'Thành công' });
        }
      }
    );
  }
});

router.delete('/category/:nameId', authenticate.ensureForApiAuthenticated, (req, res, next) => {
  const { nameId } = req.params;
  Category.findOneAndDelete({ nameId: nameId }, (err, ress) => {
    if (err) { res.status(400).json({ msg: 'Có lỗi!' }); }
    else {
      res.status(200).json({ msg: 'Thành công' });
    }
  })
})

module.exports = router;
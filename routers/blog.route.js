const express = require('express');
const md = require('markdown-it')();
const moment = require('moment');

const Blog = require('../models/blog.model');

const router = express.Router();

router.get('/', function(req, res, next) {
	Blog.find()
		.sort({ dateCreated: "descending" })
		.exec((err, blogs) => {
			if (err) return next(err);
			let htmledBlog = blogs.map(function(elem) {
				return {
					title: elem.title,
					dateCreated: moment(elem.dateCreated).format("DD/MM/YYYY"),
					content: md.render(elem.content).split('\n').join('')
				}
			})
			res.render('blog', {
				msg: htmledBlog,
				title: 'Blog'
			});
		})
});

router.get('/add', (req, res, next) => {
	res.render('newBlog', {
		title: "Thêm bài viết mới"
	});
});

router.post('/add', (req, res, next) => {
	let title = req.body.title;
	let content = req.body.content;

	let newBlog = new Blog({
		title: title,
		content: content
	});
	newBlog.save(next);
	
	res.redirect('/blog');
});

module.exports = router;
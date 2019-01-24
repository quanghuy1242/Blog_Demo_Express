const express = require('express');
const md = require('markdown-it')();
const moment = require('moment');

const authenticate = require('../middlewares/auth.middleware');

const Blog = require('../models/blog.model');

const router = express.Router();

router.get('/', function(req, res, next) {
	let p = parseInt(req.query.page) || 1;
	let perPage = 4;
	let start = (p - 1) * perPage;
	let end = p * perPage;
	Blog.find()
		.sort({ dateCreated: "descending" })
		.exec((err, blogs) => {
			if (err) return next(err);
			let blogModified = blogs.slice(start, end);
			let htmledBlog = blogModified.map(function(elem) {
				return {
					title: elem.title,
					dateCreated: moment(elem.dateCreated).format("DD/MM/YYYY"),
					content: md.render(elem.content).split('\n').join(''),
					_id: elem._id
				}
			})

			page = Math.ceil(blogs.length / perPage);
			let prev = p - 1;
			let ne = p + 1;
			if (prev === 0) prev = -1;
			if (ne > page) ne = -1;

			res.render('blog', {
				msg: htmledBlog,
				title: 'Blog',
				page: {
					prev: prev,
					now: p,
					next: ne
				}
			});
		})
});

router.get('/add', authenticate.ensureAuthenticated, (req, res, next) => {
	res.render('newBlog', {
		title: "Thêm bài viết mới"
	});
});

router.post('/add', authenticate.ensureAuthenticated, (req, res, next) => {
	let title = req.body.title;
	let content = req.body.content;

	let newBlog = new Blog({
		title: title,
		content: content
	});
	newBlog.save(next);
	
	res.redirect('/blog');
});

router.get('/:blogId', function (req, res, next) {
	let blogId = req.params.blogId;
	Blog.findById(blogId, (err, blog) => {
		if (err) return next(err);

		res.render('blogDetail', {
			title: blog.title,
			blog: {
				title: blog.title,
				dateCreated: moment(blog.dateCreated).format("DD/MM/YYYY"),
				content: md.render(blog.content).split('\n').join(''),
			}
		})
	})
})

module.exports = router;
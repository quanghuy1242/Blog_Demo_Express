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
			for (let i in blogModified) {
				blogModified[i].time = moment(blogModified[i].dateCreated).format("DD/MM/YYYY");
				blogModified[i].content = md.render(blogModified[i].content).split('\n').join('')
			}
			res.render('blog', {
				msg: blogModified,
				title: 'Blog',
				page: {
					prev: (p - 1) === 0 ? -1 : p - 1,
					now: p,
					next: (p + 1) > Math.ceil(blogs.length / perPage) ? -1 : p + 1
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
	
	req.flash("info", "Đã thêm Blog mới!");
	res.redirect('/blog');
});

router.get('/:blogId', function (req, res, next) {
	let blogId = req.params.blogId;
	Blog.findById(blogId, (err, blog) => {
		if (err) return next(err);
		blog.time = moment(blog.dateCreated).format("DD/MM/YYYY");
		blog.content = md.render(blog.content).split('\n').join('');
		res.render('blogDetail', {
			title: blog.title,
			blog: blog
		})
	})
})

router.get('/edit/:blogId', authenticate.ensureAuthenticated, function (req, res, next) {
	Blog.findById(req.params.blogId, (err, foundBlog) => {
		if (err) return next(err);
		res.render("editBlog", {
			title: "Edit your content",
			blog: foundBlog
		})
	});
});

router.post('/edit/:blogId', authenticate.ensureAuthenticated, function (req, res, next) {
	Blog.updateOne(
		{ _id: req.params.blogId },
		{
			$set: {
				title: req.body.title,
				content: req.body.content
			}
		},
		function (err, response) {
			if (err) return next(err);
			Blog.findById(req.params.blogId, (err, blog) => {
				if (err) return next(err);
				blog.time = moment(blog.dateCreated).format("DD/MM/YYYY");
				blog.content = md.render(blog.content).split('\n').join('');
				res.render('blogDetail', {
					title: blog.title,
					blog: blog
				})
			})
		}
	);
});

router.post('/delete/:blogId', authenticate.ensureAuthenticated, function (req, res, next) {
	Blog.remove({ _id: req.params.blogId }, function (err, response) {
		if (err) return next(err);
		req.flash("info", "Blog đã được xoá thành công!");
		res.redirect('/blog');
	})
});

module.exports = router;
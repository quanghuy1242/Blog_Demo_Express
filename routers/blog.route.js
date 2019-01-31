const express = require('express');
const ConverttoMarkdown = require('../Utilities/ConverttoMarkdown');

const authenticate = require('../middlewares/auth.middleware');

const Blog = require('../models/blog.model');

const router = express.Router();

router.get('/', async function (req, res, next) {
	let p = parseInt(req.query.page) || 1;
	let perPage = 4;
	let blogsCount = await Blog.countDocuments();
	let pinBlogs = await Blog.find({ isPin: true });
	Blog.find()
		.sort({ dateCreated: "descending" })
		.skip((p - 1) * perPage)
		.limit(perPage)
		.exec((err, blogs) => {
			if (err) return next(err);
			ConverttoMarkdown.ConverttoMarkdown([...pinBlogs, ...blogs]);
			res.render('blog', {
				msg: [...pinBlogs, ...blogs],
				title: 'Blog',
				page: {
					prev: (p - 1) === 0 ? -1 : p - 1,
					now: p,
					next: (p + 1) > Math.ceil(blogsCount / perPage) ? -1 : p + 1
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
	newBlog.save();
	
	req.flash("info", "Đã thêm Blog mới!");
	res.redirect('/blog');
});

router.get('/edit/:blogId', authenticate.ensureAuthenticated, function (req, res, next) {
	Blog.findById(req.params.blogId, (err, foundBlog) => {
		if (err) return next();
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
				ConverttoMarkdown.ConverttoMarkdown(blog);
				res.render('blogDetail', {
					title: blog.title,
					blog: blog
				});
			});
		}
	);
});

router.post('/delete/:blogId', authenticate.ensureAuthenticated, function (req, res, next) {
	Blog.deleteOne({ _id: req.params.blogId }, function (err, response) {
		if (err) return next(err);
		req.flash("info", "Blog đã được xoá thành công!");
		res.redirect('/blog');
	});
});

router.post('/:pinState/:blogId', async (req, res, next) => {
	let pinState = req.params.pinState;

	let pinBlogCount = await Blog.find({ isPin: true }).countDocuments();
	if (pinBlogCount !== 0 && pinState === 'pin') {
		req.flash("info", "Không thể pin hai post một lượt, hãy gỡ pin bài đăng hiện tại và chọn lại bài đăng cần pin!");
		res.redirect('/blog');
		return;
	}

	Blog.updateOne(
		{ _id: req.params.blogId },
		{
			$set: {
				isPin: pinState === 'pin' ? true : false
			}
		},
		function (err, response) {
			if (err) return next(err);
		}
	);
	res.redirect('/blog');
});

router.get('/search', function (req, res, next) {
	let q = req.query.q;
	Blog.find({ title: new RegExp(q, 'i') }, (err, blogs) => {
		if (err) return next(err);
		ConverttoMarkdown.ConverttoMarkdown(blogs);
		res.render('blog', {
			msg: blogs,
			title: "Kết quả tìm kiếm",
			query: q
		});
	});
});

router.get('/:blogId', function (req, res, next) {
	let blogId = req.params.blogId;
	Blog.findById(blogId, (err, blog) => {
		if (err) return next();
		ConverttoMarkdown.ConverttoMarkdown(blog);
		res.render('blogDetail', {
			title: blog.title,
			blog: blog
		})
	})
})

module.exports = router;
const express = require('express');
const ModifiedPost = require('../util/ModifiedPost');
const mongoose = require('mongoose');

const authenticate = require('../middlewares/auth.middleware');

const Blog = require('../models/blog.model');

const router = express.Router();

router.get('/', async function (req, res, next) {
  console.log(res.locals.currentUser);
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
      ModifiedPost.addProperties([...pinBlogs, ...blogs]);
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
    content: content,
    userId: res.locals.currentUser._id
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
				ModifiedPost.addProperties(blog);
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
    ModifiedPost.addProperties(blogs);
		res.render('blog', {
			msg: blogs,
			title: "Kết quả tìm kiếm",
			query: q
		});
	});
});

router.get('/demo', function (req, res, next) {
	Blog.aggregate(
		[
			{
				$group: {
					_id: { year: { $year: "$dateCreated" }, month: { $month: "$dateCreated" } },
					count: { $sum: 1 }
				}
			}
		],
		function(err, rs) {
			if (err) return next(err);
			res.json(rs);
		}
	);
});

router.get('/:name/:blogId', function (req, res, next) {
	let { name, blogId } = req.params;
	Blog.findById(blogId, (err, blog) => {
    if (err) return next();
		ModifiedPost.addProperties(blog);
    if (name !== blog.titleWithoutAccentAndSpace) {
      res.redirect('/blog/' + blog.titleWithoutAccentAndSpace + '/' + blogId);
    }
		res.render('blogDetail', {
			title: blog.title,
			blog: blog
		});
	});
});

router.get('/:year/:month?/:day?/:blogId?', async function (req, res, next) {
	let { year, month, day, blogId } = req.params;

	let p = parseInt(req.query.page) || 1;
	let perPage = 4;
	let blogsCount = await Blog.countDocuments();

	let o_id;
	try {
		o_id = mongoose.Types.ObjectId(blogId);
	} catch (error) {
		return next();
	}

	if (year.toString().length >= 6) return next();

	let filter = { $match: { "year": parseInt(year), "month": parseInt(month), "day": parseInt(day), "_id": o_id } };
	if (!blogId) filter = { $match: { "year": parseInt(year), "month": parseInt(month), "day": parseInt(day) } };
	if (!day) filter = { $match: { "year": parseInt(year), "month": parseInt(month) } };
	if (!month) filter = { $match: { "year": parseInt(year) } };
	// if (!year) filter = { $match: {  } }
	Blog.aggregate(
		[
			{
				$project: 
					{
						year: { $year: "$dateCreated" },
						month: { $month: "$dateCreated" },
						day: { $dayOfMonth: "$dateCreated" },
						title: "$title",
						content: "$content",
						isPin: "$isPin",
						dateCreated: "$dateCreated"
					}
			},
			filter,
			{ $sort: { dateCreated: -1 } },
			{ $skip: (p - 1) * perPage }, 
			{ $limit: perPage }
		],
		function(err, blogs) {
			if (err) { return next(); }
      ModifiedPost.addProperties(blogs);
			res.render('blog', {
				title: "Kết quả lọc", 
				msg: blogs, 
				page: {
					prev: (p - 1) === 0 ? -1 : p - 1,
					now: p,
					next: (p + 1) > Math.ceil(blogsCount / perPage) ? -1 : p + 1
				}
			});
		}
	);
	console.log(req.protocol + "://" + req.get('host') + req.originalUrl);
	
});


module.exports = router;
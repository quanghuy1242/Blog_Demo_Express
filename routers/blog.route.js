const express = require('express');
const ModifiedPost = require('../util/ModifiedPost');
const passport = require('passport');

const authenticate = require('../middlewares/auth.middleware');

const Blog = require('../models/blog.model');
const Category = require('../models/category.model');

const router = express.Router();

router.get('/', async function (req, res, next) {
	let p = parseInt(req.query.page) || 1;
	let perPage = 4;
	let blogsCount = await Blog.countDocuments();
  let pinBlogs = await Blog.find({ isPin: true }).populate('user');
  let categories = await Category.find().sort({ name: 'ascending' }).limit(5);
	Blog.find()
		.sort({ dateCreated: "descending" })
		.skip((p - 1) * perPage)
    .limit(perPage)
    .populate('user')
		.exec((err, blogs) => {
      if (err) return next(err);
      ModifiedPost.addProperties([...pinBlogs, ...blogs]);
			res.render('blog', {
        pinPost: pinBlogs,
				blogs: blogs,
        title: 'Blog',
        categories: categories,
        originalUrl: req.originalUrl.split('?')[0],
				page: {
					prev: (p - 1) === 0 ? -1 : p - 1,
					now: p,
					next: (p + 1) > Math.ceil(blogsCount / perPage) ? -1 : p + 1
				}
			});
		})
});

router.get('/yourpost', authenticate.ensureAuthenticated, (req, res, next) => {
  Blog.find()
      .sort({ dateCreated: "descending" })
      .populate('user')
      .find({ user: { _id: res.locals.currentUser._id }})
      .exec((err, blogs) => {
        if (err) return next(err);
        ModifiedPost.addProperties(blogs);
        res.render('blog', {
          blogs: blogs,
          title: 'Your Post'
        })
      })
});

router.get('/manage/category', authenticate.ensureForApiAuthenticated, (req, res, next) => {
  res.render('category', {
    title: 'Management',
    nameObj: 'category'
  })
})

router.get('/add', authenticate.ensureAuthenticated, (req, res, next) => {
	res.render('newBlog', {
		title: "Thêm bài viết mới"
  });
});

router.post('/add', authenticate.ensureAuthenticated, (req, res, next) => {
	let { title, content } = req.body;

	let newBlog = new Blog({
		title: title,
    content: content,
    user: res.locals.currentUser._id
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
				res.redirect(`/blog/a/${blog._id}`)
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
		req.flash(
      'info',
      'Không thể pin hai post một lượt, hãy gỡ pin bài đăng hiện tại và chọn lại bài đăng cần pin!'
    );
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
	Blog.find({ title: new RegExp(q, 'i') }).populate('user').exec((err, blogs) => {
		if (err) return next(err);
    ModifiedPost.addProperties(blogs);
		res.render('blog', {
			blogs: blogs,
			title: "Kết quả tìm kiếm",
			query: q
		});
	});
});

router.get('/:name/:blogId', function (req, res, next) {
  let { name, blogId } = req.params;
  Blog.findById(blogId)
    .populate('user')
    .exec((err, blog) => {
      if (err) return next();
      ModifiedPost.addProperties(blog);
      if (name !== blog.titleWithoutAccentAndSpace) {
        res.redirect('/blog/' + blog.titleWithoutAccentAndSpace + '/' + blogId);
      }
      res.render('blogDetail', {
        title: blog.title,
        blog: blog
      });
    })
});

router.get('/:year/:month?/:day?', async function (req, res, next) {
  let { year, month, day } = req.params;

  let pattern = /[0-9]/;

  if (!pattern.test(year) || !pattern.test(month || '1') || !pattern.test(day || '1')) {
    next();
  }

	let p = parseInt(req.query.page) || 1;
	let perPage = 4;
	let blogsCount = await Blog.countDocuments();

	let filter = { 
    "year": parseInt(year), 
    ...(month) && { "month": parseInt(month) }, 
    ...(day) && { "day": parseInt(day) } 
  };

  Blog.aggregate()
    .project({
      year: { $year: '$dateCreated' },
      month: { $month: '$dateCreated' },
      day: { $dayOfMonth: '$dateCreated' },
      title: '$title',
      content: '$content',
      isPin: '$isPin',
      dateCreated: '$dateCreated',
      user: '$user'
    })
    .lookup({
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'user'
    })
    .unwind('user')
    .match(filter)
    .sort({ dateCreated: 'descending' })
    .skip((p - 1) * perPage)
    .limit(perPage)
    .exec((err, blogs) => {
      if (err) { return next(); }
      ModifiedPost.addProperties(blogs);
      res.render('blog', {
        title: 'Kết quả lọc',
        blogs: blogs,
        originalUrl: req.originalUrl.split('?')[0],
        page: {
          prev: p - 1 === 0 ? -1 : p - 1,
          now: p,
          next: p + 1 > Math.ceil(blogsCount / perPage) ? -1 : p + 1
        }
      });
    });
});

module.exports = router;
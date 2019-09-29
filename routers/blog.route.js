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
  let pinBlogs = await Blog.find({ isPin: true }).populate('user').populate('category');
  let categories = await Category.find().sort({ name: 'ascending' }).limit(5);
  Blog.find()
    .where('isPublic')
    .ne(false)
		.sort({ dateCreated: "descending" })
		.skip((p - 1) * perPage)
    .limit(perPage)
    .populate('user')
    .populate('category')
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
      .where('isPublic')
      .ne(false)
      .sort({ dateCreated: "descending" })
      .populate('user')
      .populate('category')
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

router.get('/privatepost', authenticate.ensureAuthenticated, (req, res, next) => {
  Blog.find({ isPublic: false })
      .sort({ dateCreated: "descending" })
      .populate('user')
      .populate('category')
      .find({ user: { _id: res.locals.currentUser._id }})
      .exec((err, blogs) => {
        if (err) return next(err);
        ModifiedPost.addProperties(blogs);
        res.render('blog', {
          blogs: blogs,
          title: 'Private Post'
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
  Category.find().sort({ name: 'ascending' }).exec((err, categories) => {
    if (err) return next();
    res.render('newBlog', {
      title: "Thêm bài viết mới",
      categories: categories
    });
  })
});

router.post('/add', authenticate.ensureAuthenticated, (req, res, next) => {
  let { title, category, content, imgUrl, tags, isPublic } = req.body;
  let tagsList = tags.split(';');
  // Nếu người dùng nhập quá 5 tag thì huỷ bài viết đó
  if (tagsList.length >= 5) {
    req.flash("error", "Không thể có quá 5 thẻ");
    res.redirect('/blog');
  } else {
    let newBlog = new Blog({
      title: title,
      content: content,
      user: res.locals.currentUser._id,
      category: category,
      imgUrl: imgUrl || null,
      tag: tags ? tagsList : [],
      isPublic: isPublic === 'on'
    });
    newBlog.save();
    
    req.flash("info", "Đã thêm Blog mới!");
    res.redirect('/blog');
  }
});

router.get('/edit/:blogId', authenticate.ensureAuthenticated, function (req, res, next) {
	Blog.findById(req.params.blogId).exec((err, foundBlog) => {
    if (err) return next();
    Category.find().sort({ name: 'ascending' }).exec((err, categories) => {
      res.render("editBlog", {
        title: "Edit your content",
        blog: foundBlog,
        categories: categories
      });
    })
	});
});

router.post('/edit/:blogId', authenticate.ensureAuthenticated, function (req, res, next) {
  let tagsList = req.body.tags.split(';');
  if (tagsList.length >= 5) {
    req.flash("error", "Không thể có quá 5 thẻ");
    res.redirect('/blog');
  } else {
    Blog.updateOne(
      { _id: req.params.blogId },
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          category: req.body.category,
          imgUrl: req.body.imgUrl,
          tag: req.body.tags ? tagsList : [],
          isPublic: req.body.isPublic === 'on',
          latestModified: Date.now()
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
  }
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
  Blog
    .find({ title: new RegExp(q, 'i') })
    .where('isPublic')
    .ne(false)
    .populate('user')
    .populate('category').exec((err, blogs) => {
      if (err) return next(err);
      ModifiedPost.addProperties(blogs);
      res.render('blog', {
        blogs: blogs,
        title: "Kết quả tìm kiếm",
        query: q
      });
    });
});

router.get('/:name/:blogId', function(req, res, next) {
  let { name, blogId } = req.params;
  Blog.findById(blogId)
    .populate('user')
    .populate('category')
    .exec((err, blog) => {
      if (err) return next();
      if (!blog.isPublic) {
      	if (!req.user) {
      		return next();
      	} else {
      		if (req.user._id.toString() !== blog.user._id.toString()) {
      			return next();
      		}
      	}
      }
      ModifiedPost.addProperties(blog);
      if (name !== blog.titleWithoutAccentAndSpace) {
        res.redirect('/blog/' + blog.titleWithoutAccentAndSpace + '/' + blogId);
      }
      res.render('blogDetail', {
        title: blog.title,
        blog: blog,
        category: blog.category ? blog.category : { name: 'Uncategorized' }
      });
    });
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
    ...(day) && { "day": parseInt(day) },
    'isPublic': { '$ne': false }
  };

  Blog.aggregate()
    .project({ // thêm field nào vô thì nhớ thêm vô đây
      year: { $year: '$dateCreated' },
      month: { $month: '$dateCreated' },
      day: { $dayOfMonth: '$dateCreated' },
      title: '$title',
      content: '$content',
      isPin: '$isPin',
      dateCreated: '$dateCreated',
      user: '$user',
      category: '$category',
      isPublic: '$isPublic',
      tag: '$tag',
      imgUrl: '$imgUrl'
    })
    .lookup({
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'user'
    })
    .unwind('user')
    .lookup({
      from: 'categories',
      localField: 'category',
      foreignField: '_id',
      as: 'category'
    }) // lookup nhiều field
    .unwind({
      'path': '$category',
      'preserveNullAndEmptyArrays': true // tìm mà không khớp khoá ngoại thì vẫn tìm ra
    })
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
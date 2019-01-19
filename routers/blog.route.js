const express = require('express');
const md = require('markdown-it')();
const moment = require('moment');

const Blog = require('../models/blog.model');

const router = express.Router();

let content1 = `
# Nguyen Quang Huy
## 16011941
- Ahaha
- Ahuhu
`;

let content2 = `
# Nguyen Minh Khanh
## Khong hoc truong nay
- Ehehe
- Uhuhu
`;

let listBlog = [content1, content2];
let htmlBlog = listBlog.map((item) => {
	return md.render(item).split('\n').join('')
})

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

module.exports = router;
const mongoose = require('mongoose');

let blogSchema = mongoose.Schema({
	title: { type: String, required: true },
	dateCreated: { type: Date, default: Date.now }
	content: { type: String, required: true }
});

blogSchema.pre("save", function(done) {
	let blog = this;
	blog.content = blog.content.split('\n').join('\\n');
	done();
})

let Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;
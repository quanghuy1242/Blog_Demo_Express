const mongoose = require('mongoose');

let blogSchema = mongoose.Schema({
	title: { type: String, required: true },
	dateCreated: { type: Date, default: Date.now },
	content: { type: String, required: true },
	isPin: { type: Boolean, default: false }
});

let Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;
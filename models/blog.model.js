const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let blogSchema = mongoose.Schema({
	title: { type: String, required: true },
	dateCreated: { type: Date, default: Date.now },
	content: { type: String, required: true },
  isPin: { type: Boolean, default: false },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  imgUrl: { type: String },
  tag: { type: [String] }
});

let Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;
const mongoose = require('mongoose');

let categorySchema = mongoose.Schema({
	nameId: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	description: { type: String, required: true },
  urlImage: { type: String, required: true }
});

let Category = mongoose.model("Category", categorySchema);
module.exports = Category;
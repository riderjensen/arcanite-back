const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
	content: {
		type: String,
		required: true
	},
	user: {
		type: String,
		required: true
	},
	comments: {
		type: Array,
		required: true,
		default: []
	}, 
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
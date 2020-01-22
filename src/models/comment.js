const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
	content: {
		type: String,
		required: true
	},
	user: {
		type: String,
		required: true
	},
	votes: {
		type: Number,
		required: true,
		default: 0
    },
    edited: {
		type: Boolean,
		required: true,
		default: false
	},
	type: {
		type: String,
		required: true,
		default: "comment"
	}
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
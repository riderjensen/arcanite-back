const Comment = require('../models/comment');
const Post = require('../models/post');

const mongoose = require('mongoose');

exports.comment = (req, res, next) => {
	const { postId, username, content } = req.body;
	if (!postId || !username || !content) {
		return res.status(401).send({ error: true, requiredAttributes: {
			postIdPresent: postId !== undefined ? true : false,
			usernamePresent: username !== undefined ? true : false,
			contentPresent: content !== undefined ? true : false
		}, message: 'Missing required attributes' });
	}
	if (mongoose.Types.ObjectId.isValid(postId)) {
		Post.findById(postId).then(returnedPost => {
			if (!returnedPost) {
				res.status(401).send({ error: true, message: 'There is no post related to that ID!' })
			}
			const comment = new Comment({
				content: content,
				user: username
			});
	
			comment.save().then(returnedComment => {
				returnedPost.comments.push(mongoose.Types.ObjectId(returnedComment._id))
				returnedPost.save().then(savedPost => {
					res.status(201).send({ message: 'Comment created!' });
				})
			})
		}).catch(err => {
			next(err);
		});
	} else {
		res.status(404).send({ error: true, message: 'Invalid ID' })
	}
}

exports.voteComment = (req, res, next) => {
	const id = req.params.id;
	if (mongoose.Types.ObjectId.isValid(id)) {
		Comment.findById(id).then(comment => {
			comment.votes++;
			comment.save().then(_ => {
				res.status(200).send({ comment })
			})
		}).catch(err => {
			next(err);
		})
	} else {
		res.status(404).send({ error: true, message: 'Invalid ID' })
	}
}

exports.editComment = (req, res, next) => {
	const id = req.params.id;
	const { content } = req.body;

	if (!content) {
		return res.status(401).send({ error: true, requiredAttributes: {
			contentPresent: content !== undefined ? true : false
		}, message: 'Missing required attributes' });
	}

	if (mongoose.Types.ObjectId.isValid(id)) {
		Comment.findById(id).then(comment => {
			if (!comment) {
				return res.status(404).json({ error: true, message: 'Could not find the comment'})
			}
			comment.edited = true;
			comment.content = content;
			comment.save().then(_ => {
				res.status(201).send({ message: "Comment edited!" })
			})
		}).catch(err => {
			next(err);
		})
	} else {
		res.status(404).send({ error: true, message: 'Invalid ID' })
	}
}
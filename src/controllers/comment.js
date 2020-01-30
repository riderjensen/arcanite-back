const Comment = require('../models/comment');
const Post = require('../models/post');

const mongoose = require('mongoose');

exports.comment = (req, res, next) => {
	const id = req.params.id;
	const { username } = req;
	const { content } = req.body;

	if (!id || !username || !content) {
		return res.status(401).send({ error: true, requiredAttributes: {
			postIdPresent: id !== undefined ? true : false,
			usernamePresent: username !== undefined ? true : false,
			contentPresent: content !== undefined ? true : false
		}, message: 'Missing required attributes' });
	}
	const myTrimmedContent = content.trim();
	if (myTrimmedContent.length > 250) {
		return res.status(401).send({ error: true, message: 'Comment too long' });
	}

	if (mongoose.Types.ObjectId.isValid(id)) {
		Post.findById(id).then(returnedPost => {
			if (!returnedPost) {
				res.status(401).send({ error: true, message: 'There is no post related to that ID!' })
			}
			const comment = new Comment({
				content: content,
				user: username,
				parent: id
			});
	
			comment.save().then(returnedComment => {
				returnedPost.comments.push(mongoose.Types.ObjectId(returnedComment._id))
				returnedPost.save().then(savedPost => {
					res.status(201).send(savedPost);
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
	const { username } = req;
	const { content } = req.body;
	const id = req.params.id;

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
			if (comment.user !== username) {
				return res.status(401).json({ error: true, message: 'You are not authorized to perform this action' })
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

exports.deleteComment = (req, res, next) => {
	const { username } = req;
	const id = req.params.id;

	if (mongoose.Types.ObjectId.isValid(id)) {
		Comment.findById(id).then(comment => {
			if (!comment) {
				return res.status(404).json({ error: true, message: 'Could not find the comment'})
			}
			if (comment.user !== username) {
				return res.status(401).json({ error: true, message: 'You are not authorized to perform this action' })
			}
			Comment.findByIdAndDelete(id).then(comment => {
				Post.findOne(comment.parent).then(post => {
					const index = post.comments.indexOf(comment.parent);
					post.comments.splice(index, 1);
					post.save().then(_ => {
						res.status(201).json({ message: 'Comment deleted' })
					})
				})
			})
		}).catch(err => {
			next(err);
		})
	} else {
		res.status(404).send({ error: true, message: 'Invalid ID' })
	}
}

const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');

const mongoose = require('mongoose');

exports.addPost = (req, res, next) => {
	const { content, username } = req.body;
	
	if (!content || !username) {
		return res.status(401).send({ error: true, requiredAttributes: {
			usernamePresent: username !== undefined ? true : false,
			passwordPresent: password !== undefined ? true : false
		}, message: 'Missing required attributes' });
	}

	User.findOne({ username: username }).then(returnedUser => {
		if (!returnedUser) {
			res.status(401).send({ error: true, message: 'No user with this username exists!' })
		}
		const post = new Post({
			content: content,
			user: username
		});

		post.save().then(returnedPost => {
			res.status(201).send({ message: 'Post created!' })
		})
	}).catch(err => {
		next(err);
	});
}

exports.getPosts = (req, res, next) => {
	Post.find().sort({createdAt: -1}).limit(20).then(posts => {
		res.status(200).send(posts)
	}).catch(err => {
		next(err);
	})
}

exports.getOnePost = (req, res, next) => {
	const id = req.params.id;
	if (mongoose.Types.ObjectId.isValid(id)) {
		Post.findById(id).then(post => {
			Comment.find({
				'_id': { $in: post.comments}
			}).then(comments => {
				res.status(200).send({
					post: post,
					comments: comments
				})
			})
		})
	} else {
		res.status(404).send({ error: true, message: 'Invalid ID' })
	}
}
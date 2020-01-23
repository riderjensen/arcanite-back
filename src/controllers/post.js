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
		Post.findById(id).populate('comments').then(post => {
			res.status(200).send({ post })
		})
	} else {
		res.status(404).send({ error: true, message: 'Invalid ID' })
	}
}

exports.votePost = (req, res, next) => {
	const id = req.params.id;
	if (mongoose.Types.ObjectId.isValid(id)) {
		Post.findById(id).then(post => {
			post.votes++;
			post.save().then(_ => {
				res.status(200).send({ post })
			})
		}).catch(err => {
			next(err);
		})
	} else {
		res.status(404).send({ error: true, message: 'Invalid ID' })
	}
}

exports.editPost = (req, res, next) => {
	const id = req.params.id;
	const { content } = req.body;

	if (mongoose.Types.ObjectId.isValid(id)) {
		Post.findById(id).then(post => {
			post.edited = true;
			post.content = content;
			post.save().then(_ => {
				res.status(201).send({ message: "Post edited!" })
			})
		}).catch(err => {
			next(err);
		})
	} else {
		res.status(404).send({ error: true, message: 'Invalid ID' })
	}
}
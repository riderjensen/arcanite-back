const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');

const mongoose = require('mongoose');

exports.addPost = (req, res, next) => {
	const { username } = req;
	const { content } = req.body;
	if (!content || !username) {
		return res.status(401).send({ error: true, requiredAttributes: {
			usernamePresent: username !== undefined || username !== '' ? true : false,
			contentPresent: content !== undefined || content !== '' ? true : false
		}, message: 'Missing required attributes' });
	}

	const myTrimmedContent = content.trim();
	if (myTrimmedContent.length > 250) {
		return res.status(401).send({ error: true, message: 'Post too long' });
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
		if (!posts) {
			return res.status(404).json({ error: true, message: 'Could not find the posts'})
		}
		res.status(200).send(posts);
	}).catch(err => {
		next(err);
	})
}

exports.getOnePost = (req, res, next) => {
	const id = req.params.id;
	
	if (mongoose.Types.ObjectId.isValid(id)) {
		Post.findById(id).populate('comments').then(post => {
			if (!post) {
				return res.status(404).json({ error: true, message: 'Could not find the post'})
			}
			res.status(200).send({ post })
		})
	} else {
		res.status(404).send({ error: true, message: 'Invalid ID' })
	}
}

exports.getUserPostsAndComments = (req, res, next) => {
	const { username } = req;

	Post.find({ user: username }).sort({createdAt: -1}).then(posts => {
		Comment.find({ user: username }).sort({createdAt: -1}).then(comments => {
			const combinedPostsAndComments = [...posts, ...comments]
			res.status(200).send({
				posts: combinedPostsAndComments
			})
		}).catch(err => {
		next(err);
		})
	}).catch(err => {
		next(err);
	})

}

exports.votePost = (req, res, next) => {
	const id = req.params.id;

	if (mongoose.Types.ObjectId.isValid(id)) {
		Post.findById(id).then(post => {
			if (!post) {
				return res.status(404).json({ error: true, message: 'Could not find the post'})
			}
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

exports.unVotePost = (req, res, next) => {
	const id = req.params.id;

	if (mongoose.Types.ObjectId.isValid(id)) {
		Post.findById(id).then(post => {
			if (!post) {
				return res.status(404).json({ error: true, message: 'Could not find the post'})
			}
			post.votes--;
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
	const { username } = req;
	const id = req.params.id;
	const { content } = req.body;

	if (mongoose.Types.ObjectId.isValid(id)) {
		Post.findById(id).then(post => {
			if (!post) {
				return res.status(404).json({ error: true, message: 'Could not find the post'})
			}
			if (post.user !== username) {
				return res.status(401).json({ error: true, message: 'You are not authorized to perform this action' })
			}
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

exports.deletePost = (req, res, next) => {
	const { username } = req;
	const id = req.params.id;

	if (mongoose.Types.ObjectId.isValid(id)) {
		Post.findById(id).then(post => {
			if (!post) {
				return res.status(404).json({ error: true, message: 'Could not find the post'})
			}
			if (post.user !== username) {
				return res.status(401).json({ error: true, message: 'You are not authorized to perform this action' })
			}
			Post.findByIdAndDelete(id).then(retPost => {
				Comments.deleteMany({id: { $in: retPost.comments}}).then(resp => {
					return res.status(202).json({ message: 'Post deleted' })
				})
			}).catch(err => {
				next(err);
			})
		}).catch(err => {
			next(err);
		})
	} else {
		res.status(404).send({ error: true, message: 'Invalid ID' })
	}
}

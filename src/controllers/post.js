const Post = require('../models/post');
const User = require('../models/user');

exports.post = (req, res, next) => {
	const { content, username } = req.body;

	User.findOne({ username: username }).then(returnedUser => {
		if (!returnedUser) {
			res.status(401).send({ message: 'No user with this username exists!' })
		}
		const post = new Post({
			content: content,
			user: username
		});

		post.save().then(returnedPost => {
			res.status(201).send({ message: 'Post created!' })
		})
	}).catch(err => {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	});
}

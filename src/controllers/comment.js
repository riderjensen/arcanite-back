const Comment = require('../models/comment');
const Post = require('../models/post');

exports.comment = (req, res, next) => {
	const { postId, username, content } = req.body;

	Post.findById({ postId }).then(returnedPost => {
		if (!returnedUser) {
            res.status(401).send({ message: 'No user with this username exists!' })
		}
		const comment = new Comment({
			content: content,
			user: username
		});

		comment.save().then(returnedComment => {
            returnedPost.comments.push(returnedComment._id)
            returnedPost.save().then(savedPost => {
                res.status(201).send({ message: 'Comment created!' });
            })
		})
	}).catch(err => {
		next(err);
	});
}

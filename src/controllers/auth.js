const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = async (req, res, next) => {
	const email = req.body.email;
	const username = req.body.username;
	const password = req.body.password;
	try {
		const hashedPw = await bcrypt.hash(password, 12)

		const user = new User({
			email: email,
			password: hashedPw,
			username: username
		});
		user.save().then(result => {
			const token = jwt.sign({
				username: user.username,
				userId: result._id.toString()
			}, 'ZORmyTNgrMCClPb6rPuX', { expiresIn: '1d' });
			res.status(201).json({ message: 'User created!', token: token, userId: result._id })
		})
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}

}

exports.login = async (req, res, next) => {
	const username = req.body.username;
	const password = req.body.password;

	try {
		const user = await User.findOne({ username: username });
		if (!user) {
			const error = new Error('A user with this username could not be found');
			error.statusCode = 401;
			throw error;
		}
		const isEqual = await bcrypt.compare(password, user.password);
		if (!isEqual) {
			const error = new Error('Wrong password');
			error.statusCode = 401;
			throw error;
		}
		const token = jwt.sign({
			username: user.username,
			userId: user._id.toString()
		}, 'ZORmyTNgrMCClPb6rPuX', { expiresIn: '1d' });
		res.status(200).json({ token: token, userId: user._id.toString() });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}

}
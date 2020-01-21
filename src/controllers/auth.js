const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = (req, res, next) => {
	const { email, username, password } = req.body;
	User.findOne({ username: username }).then(returnedUser => {
		if (returnedUser) {
			res.status(401).send({ message: 'A user with this username already exists!' })
		}
		bcrypt.hash(password, bcrypt.genSaltSync(12), null, function (err, hashedPw) {
			if (err) throw err;
			const user = new User({
				email: email,
				password: hashedPw,
				username: username
			});
			user.save().then(result => {
				jwt.sign({
					username: user.username,
					userId: result._id.toString()
				}, 'ZORmyTNgrMCClPb6rPuX', { expiresIn: '1d' }, function(err, token) {
					if (err) throw err;
					res.status(201).send({ message: 'User created!', token: token, userId: result._id })
				})
			})
		})
	}).catch(err => {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	})
}

exports.login = (req, res, next) => {
	const { username, password } = req.body;

	User.findOne({ username: username }).then(returnedUser => {
		if (!returnedUser) {
			res.status(401).send({ message: 'A user with this username could not be found!' })
		}
		bcrypt.compare(password, user.password, function(err, isEqual) {
			if (!isEqual) {
				res.status(401).send({ message: 'Passwords do not match!' })
			}
			jwt.sign({
				username: user.username,
				userId: user._id.toString()
			}, 'ZORmyTNgrMCClPb6rPuX', { expiresIn: '1d' }, function (err, token) {
				res.status(200).json({ token: token, userId: user._id.toString() });
			});
		})
	}).catch(err => {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	})
}
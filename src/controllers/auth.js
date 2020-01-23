const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = (req, res, next) => {
	const { email, username, password } = req.body;

	if (!email || !username || !password) {
		return res.status(401).send({ error: true, requiredAttributes: {
			emailPresent: email !== undefined ? true : false,
			usernamePresent: username !== undefined ? true : false,
			passwordPresent: password !== undefined ? true : false
		}, message: 'Missing required attributes' });
	}
	// add in password validation
	User.findOne({ username: username }).then(returnedUser => {
		if (returnedUser) {
			return res.status(401).send({ message: 'A user with this username already exists!' });
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
					res.status(201).send({ message: 'User created!', token: token, user: { 
						id: result._id.toString(),
						username: user.username
					} })
				})
			})
		})
	}).catch(err => {
		next(err);
	})
}

exports.login = (req, res, next) => {
	const { username, password } = req.body;

	if (!username || !password) {
		return res.status(401).send({ error: true, requiredAttributes: {
			usernamePresent: username !== undefined ? true : false,
			passwordPresent: password !== undefined ? true : false
		}, message: 'Missing required attributes' });
	}

	User.findOne({ username: username }).then(returnedUser => {
		if (!returnedUser) {
			return res.status(401).send({ message: 'A user with this username could not be found!' })
		}
		bcrypt.compare(password, returnedUser.password, function(err, isEqual) {
			if (!isEqual) {
				return res.status(401).send({ message: 'Passwords do not match!' })
			}
			jwt.sign({
				username: returnedUser.username,
				userId: returnedUser._id.toString()
			}, 'ZORmyTNgrMCClPb6rPuX', { expiresIn: '1d' }, function (err, token) {
				res.status(200).json({ message: "Logged in!", token: token, user: {
					id: returnedUser._id.toString(),
					username: returnedUser.username
				} });
			});
		})
	}).catch(err => {
		next(err);
	})
}

exports.instructions = (req, res, next) => {
	res.status(200).json({
		instructions: {
			loggingIn: {
				requestType: "post",
				parameters: {
					username: "string",
					password: "string"
				}
			},
			signingUp : {
				requestType: "post",
				parameters: {
					username: "string",
					password: "string",
					email: "string"
				}
			}
		}
	})
}
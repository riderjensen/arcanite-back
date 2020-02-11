const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const checkJwt = require('../../middleware/auth');

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
			return res.status(401).send({ error: true, message: 'A user with this username already exists!' });
		}
		User.findOne({ email: email}).then(returnedEmailUser => {
			if (returnedEmailUser) {
				return res.status(401).send({ error: true, message: 'A user with this email already exists!' });
			}
			bcrypt.hash(password, bcrypt.genSaltSync(12), null, function (err, hashedPw) {
				if (err) throw err;
				const user = new User({
					email: email,
					password: hashedPw,
					username: username
				});
				user.save().then( async (returnedUser) => {
					const authenticationToken = await createAuthenticateToken(returnedUser);
					res.status(200).json({ 
						message: "Logged in!", 
						token: authenticationToken,
						user: username
					});
				})
			})
		}).catch(err => {
			next(err);
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
			return res.status(401).send({ error: true, message: 'A user with this username could not be found!' })
		}
		bcrypt.compare(password, returnedUser.password, async function(err, isEqual) {
			if (!isEqual) {
				return res.status(401).send({ error: true, message: 'Passwords do not match!' })
			}
			const authenticationToken = await createAuthenticateToken(returnedUser);
			res.status(200).json({ 
				message: "Logged in!", 
				token: authenticationToken,
				user: username
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

exports.checkAuth = (req, res, next) => {
	req.checkAuth = true;
	checkJwt(req, res, next);
}

function createAuthenticateToken(returnedUser) {
	return jwt.sign({
		username: returnedUser.username,
		userId: returnedUser._id.toString()
	}, process.env.jwtsecret, { expiresIn: '1d' });
}
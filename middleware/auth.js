const jwt = require('jsonwebtoken');

const { jwtsecret } = require('../../env').env;

module.exports = (req, res, next) => {
	const authHeader = req.get('Authorization');
	if (!authHeader) {
		req.isAuth = false;
		return res.status(400).json({ error: true, message: 'Missing Auth Header' })
	}
	jwt.verify(authHeader, jwtsecret, function(err, decodedToken) {
		if (err) {
			req.isAuth = false;
			return res.status(401).json({ error: true, message: 'Error decoding token, try logging in again' })
		}
		if (!decodedToken) {
			req.isAuth = false;
			return res.status(401).json({ error: true, message: 'Decoded token invalid' })
		}
		// creturn early for checkAuth when front end starts
		if (req.checkAuth) {
			return res.status(200).json({
				username: decodedToken.username
			})
		}
		req.userId = decodedToken.userId;
		req.username = decodedToken.username;
		req.isAuth = true;
		next();
	})
}
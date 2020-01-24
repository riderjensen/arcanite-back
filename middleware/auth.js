const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
	const authHeader = req.get('Authorization');
	if (!authHeader) {
		req.isAuth = false;
		return res.status(401).json({ error: true, message: 'Missing Auth Header' })
	}
	jwt.verify(authHeader, 'ZORmyTNgrMCClPb6rPuX', function(err, decodedToken) {
		if (err) {
			req.isAuth = false;
			return res.status(401).json({ error: true, message: 'Error decoding token, try logging in again' })
		}
		if (!decodedToken) {
			req.isAuth = false;
			return res.status(401).json({ error: true, message: 'Decoded token invalid' })
		}
		req.userId = decodedToken.userId;
		req.username = decodedToken.username;
		req.isAuth = true;
		next();
	})
}
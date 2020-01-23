const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
	const authHeader = req.get('Authorization');
	if (!authHeader) {
		req.isAuth = false;
		return next({ error: true, message: 'Not authorized'});
	}
	const token = authHeader.split(' ')[1];
	const decodedToken;
	try {
		decodedToken = jwt.verify(token, 'ZORmyTNgrMCClPb6rPuX');
	} catch (err) {
		req.isAuth = false;
		return next({ error: true, message: 'Not authorized'});
	}
	if (!decodedToken) {
		req.isAuth = false;
		return next({ error: true, message: 'Not authorized'});
	}
	req.userId = decodedToken.userId;
	req.isAuth = true;
	next();
}
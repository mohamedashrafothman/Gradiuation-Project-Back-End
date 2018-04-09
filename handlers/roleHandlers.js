// got it from here
// https://exceptionshub.com/node-js-express-js-user-permission-security-model.html
module.exports.requireRole = (role) => {
	return function (req, res, next) {
		if (req.user.role === role) {
			next();
		} else {
			res.sendStatus(403);
		}
	}
};
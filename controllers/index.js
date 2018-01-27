module.exports.getHome = (req, res, next)=> {
	res.render('index', {
		title: 'Home Page'
	});
}
const Company = require('../models/company');

module.exports.getHome = async (req, res, next)=> {
	const companies = await Company.find();
	res.render('home', { company: req.user, companies});
};

module.exports.getDashboard = (req, res, next)=> {
	res.render('index', {
		title: 'Home Page',
		company: req.user
	});
};
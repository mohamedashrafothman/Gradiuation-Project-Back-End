const Company = require('../models/company');

module.exports.getHome = async (req, res, next)=> {
	const companies = await Company.find().limit(4).populate('trips').exec();
	res.render('home', { company: req.user, companies});
};

module.exports.getDashboard = (req, res, next)=> {
	res.render('index', {
		title: 'Home Page',
		company: req.user
	});
};

module.exports.getCompanies = async (req, res, next) => {
	const companies = await Company.find();
	res.render('companies', { company: req.user, companies });
};
const Company = require('../models/company');

module.exports.getCompanies = async (req, res, next)=> {
	const companies = await Company.find();
	res.json({
		companies
	});
};

module.exports.createCompanies = async (req, res, next)=> {
	
};
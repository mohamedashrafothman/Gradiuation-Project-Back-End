const Company = require('../models/user');
const Trip    = require('../models/trip');
const Review  = require('../models/review');


module.exports.getCompanies = async (req, res, next) => {
	const companies = await Company.find().where('role').equals('admin').populate('trips').populate('reviews').exec();
	res.json(companies);
}

module.exports.getcompany = async (req, res, next) => {
	const company = await Company.findOne({
		slug: req.params.company
	}).populate('trips').populate('reviews').exec();
	res.json(company);
};


module.exports.getTrips = async (req, res, next) => {
	const trips = await Trip.find().where('removed').equals('false').populate('author').exec();
	res.json(trips);
};
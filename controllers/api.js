const Company = require('../models/user');
const Trip    = require('../models/trip');
const Review  = require('../models/review');

module.exports = {
	getCompanies: async (req, res, next) => {
		const companies = await Company
			.find()
			.where('role')
			.equals('admin')
			.populate('trips')
			.populate('reviews')
			.select('name _id photo trips reviews')
			.exec();
		for (var i = 0; i < companies.length; i++) {
			companies[i].photo = `http://${req.host}/img/uploads/${companies[i].photo}`;
		}
		res.json(companies);
	},
	getCompany: async (req, res, next) => {
		const company = await Company
			.findOne({
				_id: req.params.company
			})
			.populate('trips')
			.populate('reviews')
			.exec();
		company.photo = `http://${req.host}/img/uploads/${company.photo}`;
		res.json(company);
	},
	getCompanyTrips: async (req, res, next) => {
		const trips = await Trip
			.find()
			.where('author')
			.equals(req.params.company)
			.populate('requests')
			.populate('author')
			.exec();
		res.json(trips);
	},
	getCompanySingleTrip: async (req, res, next) => {
		const trip = await Trip
			.findOne({
				_id: req.params.trip
			})
			.populate('author')
			.populate('requests')
			.exec();
		res.json(trip);
	},
	getTrips: async (req, res, next) => {
		const trips = await Trip
			.find()
			.where('removed')
			.equals('false')
			.populate('author')
			.exec();
		res.json(trips);
	},
	getHomePAge: async (req, res, next) => {
		const companies = await Company
			.find()
			.where('role')
			.equals('admin')
			.select('name _id photo')
			.exec();
		for (var i = 0; i < companies.length; i++) {
			companies[i].photo = `http://${req.host}/img/uploads/${companies[i].photo}`;
		}
		res.json(companies);
	}

};
const User = require('../models/user');
const Trip = require('../models/trip');

module.exports.getHome = async (req, res, next)=> {
	const companies = await User.find({role:"admin"}).limit(4).populate('trips').exec();
	res.render('home', {companies});
};
module.exports.getCompanies = async (req, res, next) => {
	const companies = await User.find({role:"admin"}).populate('trips').exec();
	res.render('companies/companies', { user: req.user, companies });
};
module.exports.getContactUs = (req, res, next) => {
	res.render('contact-us', {title: "Contact Us"});
};

module.exports.getHajj = (req, res, next)=> {
	res.render('hajj-shaaer', {title: "Shaaer Al-Hajj"});
};

module.exports.getUmrah = (req, res, next) => {
	res.render('umrah-shaaer', { title: "Shaaer Al-Umrah" });
};

module.exports.getSingleCompany = async (req, res, next)=> {
	const company = await User.findOne({ slug: req.params.company }).populate('trips').exec();
	const trips = await Trip.find().where('author', company._id).and({removed: false}).limit(10).exec();
	res.render('companies/single-company', {
		title: `${company.name} Company`,
		company: company,
		user: req.user,
		trips
	});
};

module.exports.getTrips = async (req, res, next)=> {

	const page = req.params.page || 1;
	const limit = 8;
	const skip = (page * limit) - limit;
	const trips = await Trip.find().where('removed', false).skip(skip).limit(limit).sort({created: 'desc'}).populate('author').exec();
	const tripsCount = await Trip.count().exec();
	const pages = Math.ceil(tripsCount / limit);

	if(!trips.length && skip){
		res.redirect(`/trips/${pages}`);
		return;
	}

	res.render('trips/trips', {
		title: `Trips`,
		trips,
		page, 
		pages, 
		count: tripsCount
	});
}
const User = require('../models/user');

module.exports.getHome = async (req, res, next)=> {
	const companies = await User.find({role:"admin"}).limit(4).populate('trips').exec();
	res.render('home', {companies});
};
module.exports.getCompanies = async (req, res, next) => {
	const companies = await User.find({role:"admin"}).populate('trips').exec();
	res.render('companies', { user: req.user, companies });
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
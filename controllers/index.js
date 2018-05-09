const User   = require('../models/user');
const Trip   = require('../models/trip');
const Review = require('../models/review');
const h      = require('../helpers');


module.exports.getHome = async (req, res, next) => {
	const companies = await User.find({
		role: "admin"
	}).limit(4).populate('trips').exec();
	res.render('home', {
		companies,
		title: "Home"
	});
};
module.exports.getCompanies = async (req, res, next) => {

	// for pagenation purpose
	const page      = req.params.page || 1;
	const limit     = 8;
	const skip      = (page * limit) - limit;
	const companies = await User.find({
		role: "admin"
	}).skip(skip).limit(limit).sort({
		created: 'desc'
	}).populate('trips').exec();
	const companiesCount = await User.find({
		role: "admin"
	}).count().exec();
	const pages = Math.ceil(companiesCount / limit);

	if (!companies.length && skip) {
		res.redirect(`/companies/${pages}`);
		return;
	}

	res.render('companies/companies', {
		user: req.user,
		companies,
		pages,
		count: companiesCount,
		page
	});
};
module.exports.getContactUs = (req, res, next) => {
	res.render('contact-us', {
		title: "Contact Us"
	});
};

module.exports.getHajj = (req, res, next) => {
	res.render('hajj-shaaer', {
		title: "Shaaer Al-Hajj"
	});
};

module.exports.getUmrah = (req, res, next) => {
	res.render('umrah-shaaer', {
		title: "Shaaer Al-Umrah"
	});
};

module.exports.getSingleCompany = async (req, res, next) => {
	const company = await User.findOne({
		slug: req.params.company
	}).populate('reviews').populate('trips').exec();
	const trips = await Trip.find().where('author', company._id).and({
		removed: false
	}).limit(10).exec();
	const reviews = await Review.find().where('company', company._id).and({
		removed: false
	}).limit(10).populate('company').populate('user').exec();

	const oneStar = await Review.find().where('company', company._id).and({
		rating: 1
	}).count().exec();
	const twoStar = await Review.find().where('company', company._id).and({
		rating: 2
	}).count().exec();
	const threeStar = await Review.find().where('company', company._id).and({
		rating: 3
	}).count().exec();
	const fourStar = await Review.find().where('company', company._id).and({
		rating: 4
	}).count().exec();
	const fiveStar = await Review.find().where('company', company._id).and({
		rating: 5
	}).count().exec();

	const rating = Math.ceil(h.starRating(oneStar, twoStar, threeStar, fourStar, fiveStar));

	res.render('companies/single-company', {
		title  : `${company.name} Company`,
		company: company,
		user   : req.user,
		trips,
		reviews,
		rating
	});
};

module.exports.getTrips = async (req, res, next) => {

	const page      = req.params.page || 1;
	const limit     = 10;
	const skip      = (page * limit) - limit;
	const stars     = req.query.stars || 1;
	const type      = req.query.type || "umrah";
	const travel_type = req.query.travel_type || "air";
	const price_max = req.query.price_max || 50000;
	const price_min = req.query.price_min || 1;
	var trips;
	if (Object.keys(req.query).length === 0) {
		trips = await Trip.find({
			removed: false
		}).skip(skip).limit(limit).sort({
			created: 'desc'
		}).populate('author').exec();
	} else {
		trips = await Trip.find({
			removed       : false,
			'hotel.rating': stars,
			price         : {
				$gte: price_min,
				$lte: price_max
			},
			type: type,
			travel_type: travel_type
		}).skip(skip).limit(limit).sort({
			created: 'desc'
		}).populate('author').exec();
	}

	const tripsCount = await Trip.find({
		removed: false
	}).count().exec();
	const pages = Math.ceil(tripsCount / limit);


	if (!trips.length && skip) {
		res.redirect(`/trips/${pages}`);
		return;
	}

	res.render('trips/trips', {
		title: `Trips`,
		user : req.user,
		trips,
		page,
		pages,
		count: tripsCount,
		type,
		stars,
		price_max,
		price_min,
		travel_type
	});
}

module.exports.addReview = async (req, res, next) => {
	      req.body.user    = req.user._id;
	      req.body.company = req.params.id;
	const newReview        = new Review(req.body);
	await newReview.save();
	await User.findOneAndUpdate({
		_id: req.body.company
	}, {
		$push: {
			reviews: newReview._id
		}
	}, {
		upsert: true
	}, (err) => {
		if (err) {
			console.log(err);
		} else {
			req.flash('success', 'New Review Added!');
			res.redirect('back');
		}
	});


};

module.exports.deleteReview = async (req, res, next) => {
	const review = await Review.findOneAndUpdate({
		_id: req.params.id
	}, {
		$set: {
			removed: true
		}
	}, {
		new: true
	}).exec();
	req.flash('success', `Successfully deactivated review, Users can't see it now. Go to Dashboard to active it.`);
	res.redirect('back');
};

module.exports.showReview = async (req, res, next) => {
	const review = await Review.findOneAndUpdate({
		_id: req.params.id
	}, {
		$set: {
			removed: false
		}
	}, {
		new: true
	}).exec();
	req.flash('success', `User can see this review now!`);
	res.redirect('back');
};
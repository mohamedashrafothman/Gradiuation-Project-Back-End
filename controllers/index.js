const User    = require('../models/user');
const Trip    = require('../models/trip');
const Request = require('../models/request');
const Review  = require('../models/review');
const h       = require('../helpers');


module.exports.getHome = async (req, res, next) => {
	const companies = await User.find({role: "admin"}).select('photo slug created name description').limit(4).populate('trips').exec();
	res.render('home', {companies,title: "Home"});
};
module.exports.getCompanies = async (req, res, next) => {

	// for pagenation purpose
	const page  = req.params.page || 1;
	const limit = 8;
	const skip  = (page * limit) - limit;

	const companies = await User.find().where('role').equals('admin').select('photo slug created name description').skip(skip).limit(limit).sort({created: 'desc'}).exec();
	const count = await User.find().where('role').equals('admin').count().exec()
	const pages = Math.ceil(count / limit);

	if (!companies.length && skip) {
		res.redirect(`/companies/${pages}`);
		return;
	}

	res.render('companies/companies', {
		title: 'Companies',
		user : req.user,
		companies,
		pages,
		count,
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
	const company = await User.findOne({slug: req.params.company}).populate('reviews').populate('trips').exec();
	const trips = await Trip.find().where('author', company._id).and({removed: false}).select('slug travel_type name duration.from duration.to description').limit(10).exec();
	const reviews = await Review.find().where('company', company._id).and({removed: false}).select('user.photo user.name user.role removed created rating text').limit(10).populate('company').populate('user').exec();

	const oneStar = await Review.find().where('company', company._id).and({rating: 1}).count().exec();
	const twoStar = await Review.find().where('company', company._id).and({rating: 2}).count().exec();
	const threeStar = await Review.find().where('company', company._id).and({rating: 3}).count().exec();
	const fourStar = await Review.find().where('company', company._id).and({rating: 4}).count().exec();
	const fiveStar = await Review.find().where('company', company._id).and({rating: 5}).count().exec();

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

	const page        = req.params.page || 1;
	const limit       = 10;
	const skip        = (page * limit) - limit;
	const stars       = req.query.stars || 1;
	const type        = req.query.type || "umrah";
	const travel_type = req.query.travel_type || "air";
	const price_max   = req.query.price_max || 50000;
	const price_min   = req.query.price_min || 1;
	var trips;
	if (Object.keys(req.query).length === 0) {
		trips = await Trip.find({
			removed: false
		}).select('travel_type slug name author._id code duration price author.name description hotel.include ').skip(skip).limit(limit).sort({
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
			type       : type,
			travel_type: travel_type
		}).select('travel_type slug name author._id code duration price author.name description hotel.include ').skip(skip).limit(limit).sort({
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

module.exports.getSingleTrip = async (req, res, next) => {

	// TODO: get trips related to theis trip based on requestes number, company, price and type

	const trip = await Trip.findOne().where('slug').equals(req.params.trip).populate('author').exec();
	res.render('trips/single-trip', {
		title: `${trip.name} trip`,
		trip
	});
};

module.exports.addReview = async (req, res, next) => {
	      req.body.user    = req.user._id;
	      req.body.company = req.params.companyId;
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

module.exports.requestTrip = async (req, res, next) => {

	// validate inputs
	req.sanitizeBody('name');
	req.checkBody('name', 'You must supply a name!').notEmpty();
	req.checkBody('email', 'please enter your e-mail!').isEmail();
	req.checkBody('message', 'please leave us a message').notEmpty();

	// if there are validation errors redirect back with them
	const errors = req.validationErrors();
	if (errors) {
		req.flash('danger', errors.map(err => err.msg));
		res.redirect('back');
		return;
	}

	// Update req.body with user, company and trip data
	req.body.user    = req.user._id;
	req.body.trip    = await Trip.findOne({_id: req.params.trip}).populate('author').exec();
	req.body.company = await User.findOne().where("_id").equals(req.body.trip.author._id).exec();

	// save new request to Request model
	const request = new Request(req.body);
	request.save();

	// pushing this request to trip.requests array
	await Trip.findOneAndUpdate({_id: req.params.trip}, {$push: {requests: request._id}}, {upsert: true});

	// send a success flash message and redirect back
	req.flash('success', 'Your request has been send to review, wait for company to call you soon.');
	res.redirect('back');
};
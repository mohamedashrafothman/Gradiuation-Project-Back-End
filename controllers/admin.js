const User = require('../models/user');
const Trip = require('../models/trip');
const Review = require('../models/review');
const Request = require('../models/request');
const multer = require('multer'); // allawing us to upload a photo to the server
const jimp = require('jimp'); // for resizing image
const uuid = require('uuid'); // unique idenifier package
const h = require('../helpers');
const slug = require('speakingurl');


module.exports.getDashboard = async (req, res, next) => {
	const trips = await Trip.find().where('author', req.user._id).and({
		removed: false
	}).select('code name hotel.name hotel.include duration durationInDays removed').limit(10).exec();
	res.render('admin/dashboard', {
		title: 'Dashboard',
		user: req.user,
		trips
	});
};

module.exports.getProfile = async (req, res) => {
	const oneStar = await Review.find().where('company', req.user._id).and({
		rating: 1
	}).and({
		removed: false
	}).count().exec();
	const twoStar = await Review.find().where('company', req.user._id).and({
		rating: 2
	}).and({
		removed: false
	}).count().exec();
	const threeStar = await Review.find().where('company', req.user._id).and({
		rating: 3
	}).and({
		removed: false
	}).count().exec();
	const fourStar = await Review.find().where('company', req.user._id).and({
		rating: 4
	}).and({
		removed: false
	}).count().exec();
	const fiveStar = await Review.find().where('company', req.user._id).and({
		rating: 5
	}).and({
		removed: false
	}).count().exec();
	const rating = Math.ceil(h.starRating(oneStar, twoStar, threeStar, fourStar, fiveStar));

	res.render('admin/profile/profile', {
		title: 'Profile',
		company: req.user,
		rating
	});
};

module.exports.editUser = async (req, res, next) => {
	let user = await req.user;
	res.render('admin/profile/editAdmin', {
		title: `Edit ${user.name}'s profile`,
		user
	});
};
const multerOptions = {
	storage: multer.memoryStorage(),
	fileFilter(req, file, next) {
		const isPhoto = file.mimetype.startsWith('image/');
		if (isPhoto) {
			next(null, true);
		} else {
			next({
				message: 'That file type isn\'t allawed'
			});
		}
	}
};
// multer middleware
module.exports.upload = multer(multerOptions).single('photo');
module.exports.resize = async (req, res, next) => {
	// check if there is no file to resize
	if (!req.file) {
		next();
		return;
	}
	const extention = req.file.mimetype.split('/')[1];
	req.body.photo = `${uuid.v4()}.${extention}`;

	// resizing
	const photo = await jimp.read(req.file.buffer);
	await photo.resize(jimp.AUTO, 200);
	await photo.write(`./public/img/uploads/${req.body.photo}`);

	next();
};
module.exports.updateUser = async (req, res, next) => {
	req.body.location.type = 'point';
	req.body.slug = slug(req.body.name);
	// req.body.username = req.body.name.toLowerCase();
	const user = await User.findOneAndUpdate({
		_id: req.user.id
	}, req.body, {
		new: true,
		runValidator: true
	});
	req.flash('success', `Successfully update ${user.name}'s profile.`);
	res.redirect(`/dashboard/profile/${user.slug}`);
};


module.exports.getTrips = async (req, res, next) => {

	const activeTrips = await Trip.find().where('author', req.user._id).and({
		removed: false
	}).select("name hotel.name hotel.include duration durationInDays").populate('author').exec();
	const unActiveTrips = await Trip.find().where('author', req.user._id).and({
		removed: true
	}).select("name hotel.name hotel.include duration durationInDays").populate('author').exec();
	const user = req.user;
	res.render('admin/trips/trips', {
		title: "Trips",
		activeTrips,
		unActiveTrips,
		user
	});
};

module.exports.getTrip = async (req, res, next) => {
	res.render('admin/trips/addTrip', {
		title: "Add Trip"
	});
};

module.exports.addTrip = async (req, res, next) => {
	// validate body
	req.checkBody('name', 'You must enter an trip name!').notEmpty();
	req.checkBody('type', 'You must supply a Trip type!').notEmpty();
	req.checkBody('name', 'You must enter a description!').notEmpty();
	req.checkBody('hotel[include]', 'You must apply what Hotel will inlcude').notEmpty();
	req.checkBody('duration[from]', 'You must apply a trip start date').notEmpty();
	req.checkBody('duration[to]', 'You must apply a trip end date').notEmpty();
	req.checkBody('hotel[name]', 'You must add hotel name').notEmpty();

	// add trip
	const errors = req.validationErrors();
	if (errors) {
		req.flash('danger', errors.map(err => err.msg));
		res.render('admin/trips/addTrip', {
			title: 'Trips',
			body: req.body,
			flashes: req.flash()
		});
		return;
	}
	req.body.author = req.user.id;
	req.body.durationInDays = h.dateInDays(req.body.duration.from, req.body.duration.to);
	req.body.code = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);

	const trip = await new Trip(req.body).save();
	await User.findOneAndUpdate({
		_id: req.user._id
	}, {
		$push: {
			trips: trip._id
		}
	}, {
		upsert: true
	}, (err) => {
		if (err) {
			console.log(err);
		} else {
			req.flash('success', 'You added new trip');
			res.redirect('/dashboard/trips');
		}
	});
};

module.exports.deleteTrip = async (req, res, next) => {
	const trip = await Trip.findOneAndUpdate({_id: req.params.id}, {$set: {removed: true}}, {new: true}).exec();
	req.flash('success', `Successfully Deactivated ${trip.code}.`);
	res.redirect('back');
};

module.exports.activateTrip = async (req, res, next) => {
	const trip = await Trip.findOneAndUpdate({
		_id: req.params.id
	}, {
		$set: {
			removed: false
		}
	}, {
		new: true
	}).exec();
	req.flash('success', `Successfully Activated ${trip.code}.`);
	res.redirect('back');
};


module.exports.editTrip = async (req, res, next) => {
	const trip = await Trip.findOne({
		_id: req.params.id
	}).exec();
	res.render('admin/trips/addTrip', {
		title: 'Add Trip',
		trip
	});
};


module.exports.updateTrip = async (req, res, next) => {
	req.body.slug = slug(req.body.name);
	req.body.hotel.location.type = 'point';
	req.body.hotel.include = req.body.hotel.include.split(',');
	req.body.updated = new Date();
	req.body.durationInDays = h.dateInDays(req.body.duration.from, req.body.duration.to);
	const trip = await Trip.findOneAndUpdate({
		_id: req.params.id
	}, req.body, {
		new: true,
		runValidator: true
	});
	req.flash('success', `Successfully update trip number ${trip.code}.`);
	res.redirect('/dashboard/trips');
};



module.exports.getReviews = async (req, res, next) => {
	const activeReviews = await Review.find().where('company', req.user._id).and({
		removed: false
	}).select("user.name user._id user.role created rating text removed").populate('user').populate('company').exec();
	const removedReviews = await Review.find().where('company', req.user._id).and({
		removed: true
	}).select("user.name user._id user.role created rating text removed").populate('user').populate('company').exec();
	res.render('admin/reviews/reviews', {
		title: 'Reviews',
		company: req.user,
		activeReviews,
		removedReviews
	});
};


module.exports.getRequests = async (req, res, next) => {
	const Requests = await Request
							.find()
							.where({company: req.user._id})
							.populate('trip')
							.populate('user')
							.select("user.photo user.name user.photo email message status trip.name")
							.sort({field:'asc', status: 1})
							.exec();
		
	res.render('admin/requests/requests', {
		title: 'Requests',
		Requests
	});
};

module.exports.acceptRequest = async (req,res,next)=>{

	const trip = await Request.findOneAndUpdate({ _id: req.params.id }, { $set: { status: 'accepted' } }, { new: true }).exec();
	req.flash('success', `Successfully accepted the request.`);
	res.redirect('back');


};

module.exports.waitRequest = async (req, res, next)=> {
	const trip = await Request.findOneAndUpdate({ _id: req.params.id }, { $set: { status: 'waiting' } }, { new: true }).exec();
	req.flash('success', `Successfully return the request to wating status.`);
	res.redirect('back');
};

module.exports.rejectRequest = async (req, res, next)=> {
	const trip = await Request.findOneAndUpdate({ _id: req.params.id }, { $set: { status: 'rejected' } }, { new: true }).exec();
	req.flash('success', `Successfully rejected the request.`);
	res.redirect('back');
};
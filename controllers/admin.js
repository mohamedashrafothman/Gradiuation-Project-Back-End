const User = require('../models/user');
const Trip = require('../models/trip');
const Review = require('../models/review');
const multer = require('multer'); // allawing us to upload a photo to the server
const jimp = require('jimp'); // for resizing image
const uuid = require('uuid'); // unique idenifier package
const h	   = require('../helpers');


module.exports.getDashboard = async (req, res, next) => {
	const trips = await Trip.find().where('author', req.user._id).and({removed: false}).limit(10).exec();
	console.log(trips);
	res.render('admin/dashboard', {
		title: 'Dashboard',
		user: req.user,
		trips
	});
};

module.exports.getProfile = async (req, res) => {
	const activeReviews = await Review.find({company: req.user._id, removed: false}).populate('user').populate('company').exec();
	const removedReviews = await Review.find({company: req.user._id,removed: true }).populate('user').populate('company').exec();
	
		const oneStar = await Review.find().where('company', req.user._id).and({rating: 1}).and({removed:false}).count().exec();
		const twoStar = await Review.find().where('company', req.user._id).and({rating: 2}).and({removed:false}).count().exec();
		const threeStar = await Review.find().where('company', req.user._id).and({rating: 3}).and({removed:false}).count().exec();
		const fourStar = await Review.find().where('company', req.user._id).and({rating: 4}).and({removed:false}).count().exec();
		const fiveStar = await Review.find().where('company', req.user._id).and({rating: 5}).and({removed:false}).count().exec();

		const rating = Math.ceil(h.starRating(oneStar, twoStar, threeStar, fourStar, fiveStar));



	res.render('admin/profile/profile', {
		title: 'Profile',
		company: req.user,
		activeReviews, 
		removedReviews,
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
	const trips = await Trip.find({author: req.user._id}).$where('this.removed == false').populate('author').exec();
	const user = req.user;
	res.render('admin/trips/trips', {title: "Trips",trips,user});
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
		res.render('admin/trips/addTrip', {title: 'Trips',body: req.body,flashes: req.flash()});
		return;
	}
	req.body.author = req.user.id;
	req.body.durationInDays = h.dateInDays(req.body.duration.from, req.body.duration.to);
	req.body.code = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);

	const trip = await new Trip(req.body).save();
	await User.findOneAndUpdate({_id: req.user._id}, {$push: {trips: trip._id}}, {upsert: true}, (err) => {
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
	req.flash('success', `Successfully deleted ${trip.code}.`);
	res.redirect('back');
};

module.exports.updateTrip = async (req, res, next) => {
	// req.body.hotel.location.type = 'point';
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
const User = require('../models/user');
const Trip = require('../models/trip');
const multer = require('multer'); // allawing us to upload a photo to the server
const jimp = require('jimp'); // for resizing image
const uuid = require('uuid'); // unique idenifier package


module.exports.getDashboard = async (req, res, next) => {
	res.render('dashboard', {
		title: 'Dashboard',
		user: req.user
	});
};

module.exports.getProfile = async (req, res) => {
	res.render('profile', {
		title: 'Profile',
		user: req.user
	});
};

module.exports.editUser = async (req, res, next) => {
	let user = await req.user;
	res.render('editAdmin', {
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
	const trips = await Trip.find({
		author: req.user._id
	}).populate('author').exec();
	const user = req.user;
	res.render('trips', {
		title: "Trips",
		trips,
		user
	});
};

module.exports.getTrip = async (req, res, next) => {
	res.render('addTrip', {
		title: "Add Trip"
	});
};


module.exports.addTrip = async (req, res, next) => {
	// validate body
	req.checkBody('type', 'You must supply a Trip type!').notEmpty();
	req.checkBody('include', 'You must apply what trip will inlcude').notEmpty();
	req.checkBody('duration[from]', 'You must apply a trip start date').notEmpty();
	req.checkBody('duration[to]', 'You must apply a trip end date').notEmpty();

	// add trip
	const errors = req.validationErrors();
	if (errors) {
		req.flash('danger', errors.map(err => err.msg));
		res.render('trips', {
			title: 'Trips',
			body: req.body,
			flashes: req.flash()
		});
		return;
	} else {
		req.body.include = req.body.include.split(',');
		req.body.author = req.user.id;
		console.log(req.body);
		const trip = await (new Trip(req.body).save());
		User.findOneAndUpdate({
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
	}
};

module.exports.deleteTrip = async (req, res, next) => {
	const trip = await Trip.findByIdAndRemove({
		_id: req.params.id
	}).exec();
	req.flash('success', `Successfully deleted ${trip.code}.`);
	res.redirect('/dashboard/trips');
};

module.exports.updateTrip = async (req, res, next) => {
	req.body.include = req.body.include.split(',');
	req.body.updated = new Date();
	const trip = await Trip.findOneAndUpdate({
		_id: req.params.id
	}, req.body, {
		new: true,
		runValidator: true
	});
	req.flash('success', `Successfully update trip number ${trip.code}.`);
	res.redirect('/dashboard/trips');
};
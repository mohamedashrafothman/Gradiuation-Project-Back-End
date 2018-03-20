//*************************** Requiring Dependencies ***************************//
const Company = require('../models/company');
const Trip = require('../models/trip');
const multer = require('multer'); // allawing us to upload a photo to the server
const jimp = require('jimp'); // for resizing image
const uuid = require('uuid'); // unique idenifier package
//*************************** End of Requiring Dependencies ***************************//


//*************************** Regesteration Functions ***************************//
module.exports.getLogin = (req, res, next) => {
	res.render('login');
};
module.exports.getRegister = (req, res, next) => {
	res.render('register');
};
module.exports.getForgot = (req, res, next)=> {
	res.render('forgotPassword');
};
module.exports.getProfile = async (req, res)=> {
	const company = await Company.findOne({ slug: req.params.companyName});
	res.render('profile', {title: 'Profile', company});
};
// to do: 1- validate the regesteration data (done)
// 		  2- regester the company (done)
// 	      3- log the company in
module.exports.validateRegister = (req, res, next)=> {
	req.sanitizeBody('name'); // validate the name
	req.checkBody('name', 'You must supply a name!').notEmpty();
	req.checkBody('username', 'You must supply a username!').notEmpty();
	req.checkBody('contacts[email]', 'You must supply an email!').notEmpty();
	req.checkBody('contacts[email]', 'That Email is not Valid!').isEmail();
	req.sanitizeBody('contacts[email]').normalizeEmail({
		remove_dots: false,
		remove_extention: false,
		gmail_remove_subaddress: false
	});
	req.checkBody('location[address]', 'You must supply where is your company!').notEmpty();
	req.checkBody('location[country]', 'You must supply where is your company!').notEmpty();
	req.checkBody('location[city]', 'You must supply where is your company!').notEmpty();
	req.checkBody('password', 'Password Cannot be Blank!').notEmpty();
	req.checkBody('password-confirm', 'Confirmed Password cannot be blank!').notEmpty();
	req.checkBody('password-confirm', 'Your Password do not mach!').equals(req.body.password);

	const errors = req.validationErrors();
	if(errors){
		req.flash('danger', errors.map(err=> err.msg));
		res.render('register', {title: 'register', body: req.body, flashes: req.flash()});
		return ;
	}
	next();
};
module.exports.register = async (req, res, next)=> {
	var newCompany = new Company(req.body);
	Company.createCompany(newCompany, function(err, company){
		if(err) throw err;
	});
	req.flash('success', 'You are registered and can login!');
	res.redirect('/company/login');
};
module.exports.login = (req, res)=> {
	res.redirect('/company/dashboard');
};
//*************************** End of regesteration functions ***************************//



//*************************** Upload Images functions ***************************//
const multerOptions = {
	storage: multer.memoryStorage(),
	fileFilter(req, file, next){
		const isPhoto = file.mimetype.startsWith('image/');
		if(isPhoto){
			next(null, true);
		} else {
			next({message: 'That file type isn\'t allawed'});
		}
	} 
};
// multer middleware
module.exports.upload = multer(multerOptions).single('photo');
module.exports.resize = async (req, res, next)=> {
	// check if there is no file to resize
	if(!req.file){
		next();
		return ;
	}
	const extention = req.file.mimetype.split('/')[1];
	req.body.photo = `${uuid.v4()}.${extention}`;

	// resizing
	const photo = await jimp.read(req.file.buffer);
	await photo.resize(jimp.AUTO, 200);
	await photo.write(`./public/img/uploads/${req.body.photo}`);

	next();
};
//*************************** End of Upload Images functions ***************************//



//*************************** Edit Company functions ***************************//
module.exports.editCompany = async (req, res, next)=> {
	res.render('editCompany', {
		title: `Edit ${req.user.name}'s Company`,
		company: req.user
	});
};
module.exports.updateCompany = async (req, res, next)=> {
	req.body.location.type = 'point';
	const company = await Company.findOneAndUpdate({ _id: req.user.id }, req.body, { new: true, runValidator: true});
	req.flash('success', `Successfully update ${company.name}'s company.`);
	res.redirect('/company/dashboard');
};
//*************************** End of Edit Comapny functions ***************************//

//*************************** Trip functions ***************************//
// this function for check if specific store belongis to logedin user or not allowing to edit single trip
const confirmStoreOwner = (trip, company)=> {
	if(!trip.author.equals(company._id)){
		throw Error('You must own a company in order to edit a trip');
	}
};

module.exports.getTrip = async (req, res, next) => {
	res.render('addTrip', {
		title: "Add Trip"
	});
};

module.exports.addTrip = async (req, res, next)=> {
	console.log(req.body);
	// validate body
	req.checkBody('type', 'You must supply a Trip type!').notEmpty();
	req.checkBody('include', 'You must apply what trip will inlcude').notEmpty();
	req.checkBody('duration[from]', 'You must apply a trip start date').notEmpty();
	req.checkBody('duration[to]', 'You must apply a trip end date').notEmpty();

	// add trip
	const errors = req.validationErrors();
	if (errors) {
		req.flash('danger', errors.map(err => err.msg));
		res.render('trips', { title: 'Trips', body: req.body, flashes: req.flash() });
		return;
	} else {
		req.body.author = req.user.id;
		const trip = await  (new Trip(req.body).save());		
		Company.findOneAndUpdate({_id: req.user._id}, {$push:{ trips : trip._id}}, {upsert:true}, (err)=> {
			if(err){
				console.log(err);
			} else {
				req.flash('success', 'You added new trip');
				res.redirect('/company/trips');
			}
		});
	}
};

module.exports.getTrips = async (req, res, next)=> {
	const trips = await Trip.find().populate('author');
	res.render('trips', {
		title: "Trips",
		trips
	});
};
module.exports.deleteTrip = async (req, res, next)=> {
	const trip = await Trip.findByIdAndRemove({ _id: req.params.id });
	req.flash('success', `Successfully deleted ${trip.code}.`);
	res.redirect('/company/trips');
};

module.exports.updateTrip = async (req, res, next)=> {
	const trip = await Trip.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, runValidator: true });
	req.flash('success', `Successfully update trip number ${trip.code}.`);
	res.redirect('/company/trips');
};

//*************************** End Trip functions ***************************//




// module.exports.getCompanies = async (req, res, next)=> {
// 	const companies = await Company.find();
// 	res.render('companies', {
// 		title: 'Companies',
// 		companies
// 	});
// };

// module.exports.addCompany = (req, res, next)=> {
// 	res.render('addCompany', {
// 		title: 'Add New Company'
// 	});
// };

// module.exports.createCompany = async (req, res, next)=> {
// 	const company = await (new Company(req.body)).save();

// 	req.flash('success', `Successfully created ${company.name} Company.`);
// 	// res.redirect(`/companies/${company.slug}`);
// 	res.redirect('/companies'); 
// };

// module.exports.deleteCompany = async (req, res, next)=> {
// 	const company = await Company.findByIdAndRemove({ _id: req.user.id });
// 	req.flash('success', `Successfully deleted ${company.name}'s company`);
// 	res.redirect('/');
	
// };
const Company = require('../models/company');
const multer = require('multer'); // allawing us to upload a photo to the server
const jimp = require('jimp'); // for resizing image
const uuid = require('uuid'); // unique idenifier package

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



module.exports.getCompanies = async (req, res, next)=> {
	const companies = await Company.find();
	res.render('companies', {
		title: 'Companies',
		companies
	});
};

module.exports.addCompany = (req, res, next)=> {
	res.render('addCompany', {
		title: 'Add New Company'
	});
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
	await photo.resize(800, jimp.AUTO);
	await photo.write(`./public/uploads/${req.body.photo}`);

	next();
};


module.exports.createCompany = async (req, res, next)=> {
	const company = await (new Company(req.body)).save();

	req.flash('success', `Successfully created ${company.name} Company.`);
	// res.redirect(`/companies/${company.slug}`);
	res.redirect('/companies'); 
};

module.exports.editCompany = async (req, res, next)=> {
	const company = await Company.findOne({ _id: req.params.id });
	res.render('addCompany', {
		title: `Edit ${company.name}'s Company`,
		company
	});
};

module.exports.updateCompany = async (req, res, next)=> {

	req.body.location.type = 'point';
	const company = await Company.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, runValidator: true}).exec();

	req.flash('success', `Successfully update ${company.name}'s company.`);
	res.redirect('/companies');
};

module.exports.deleteCompany = async (req, res, next)=> {
	const company = await Company.findByIdAndRemove({ _id: req.params.id });
	req.flash('success', `Successfully deleted ${company.name}'s company`);
	res.redirect('/companies');
	
};
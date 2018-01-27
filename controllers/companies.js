const Company = require('../models/company');

module.exports.getCompanies = async (req, res, next) => {

	try {
		const companies = await Company.find();
		res.render('companies', {
			title: 'Companies',
			companies
		});
	} catch (error) {
		console.log('Error:', e);
	}
};

module.exports.addCompany = (req, res, next)=> {
	res.render('addCompany', {
		title: 'Add New Company'
	});
};

module.exports.createCompany = async (req, res, next)=> {
	try{
		const company = await (new Company({
			name: req.body.name,
			slug: req.body.slug,
			description: req.body.description,
			contacts: {
				mobileNumber: req.body.mobileNumber,
				email: req.body.email
			},
			location: {
				address: req.body.address,
				country: req.body.country,
				city: req.body.city
			}
		})).save();

		req.flash('success', `Successfully created ${company.name} Company.`);
		// res.redirect(`/companies/${company.slug}`);
		res.redirect('/');

	} catch(e) {
		console.log('error: ', e);
	} 
};

module.exports.editCompany = async (req, res, next)=> {
	try {
		const company = await Company.findOne({ _id: req.params.id });
		res.render('editCompany', {
			title: `Edit ${company.name} Company`,
			company
		});
	} catch (e) {
		req.flash('error', 'there is an error, please try again in a moment!');
		res.redirect('/');
	}
};

module.exports.updateCompany = async (req, res, next)=> {
	try {
		const company = await Company.findOneAndUpdate({ _id: req.params.id }, {
			name: req.body.name,
			description: req.body.description,
			contacts: {
				mobileNumber: req.body.mobileNumber,
				email: req.body.email
			},
			location: {
				address: req.body.address,
				country: req.body.country,
				city: req.body.city
			}
		}, { new: true, runValidator: true}).exec();
	
		req.flash('success', `Successfully update ${company.name}'s company.`);
		res.redirect('/companies');
	} catch (error) {
		req.flash('error', 'there is an error, please try again in a moment!');
		req.redirect('/companies');
	}
};

module.exports.deleteCompany = async (req, res, next)=> {
	try {
		const company = await Company.findByIdAndRemove({ _id: req.params.id });
		req.flash('success', `Successfully deleted ${company.name}'s company`);
		res.redirect('/');
	} catch (e) {
		req.flash('error', 'there is an error, please try again in a moment!');
		req.redirect('/companies');
	}
};
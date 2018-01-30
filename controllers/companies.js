const Company = require('../models/company');

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

module.exports.createCompany = async (req, res, next)=> {
	const company = await (new Company(req.body)).save();

	req.flash('success', `Successfully created ${company.name} Company.`);
	// res.redirect(`/companies/${company.slug}`);
	res.redirect('/companies'); 
};

module.exports.editCompany = async (req, res, next)=> {
	const company = await Company.findOne({ _id: req.params.id });
	res.render('addCompany', {
		title: `Edit ${company.name} Company`,
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
const passport   = require('passport');
const crypto     = require('crypto');
const mongoose   = require('mongoose');
const promisify  = require('es6-promisify');
const bcrypt     = require('bcryptjs');
const nodemailer = require('nodemailer');
const pug        = require('pug');
const juice      = require('juice');
const htmlToText = require('html-to-text');
const Company    = require('../models/company.js');
// const mail       = require('../handlers/mail');

module.exports.login = passport.authenticate('local',{ 
	successRedirect: '/dashboard', 
	failureRedirect: '/company/login', 
	failureFlash: 'Invaled User', 
	successFlash: 'Welcome Back!' 
});

module.exports.logout = (req, res) => {
	req.logout();
	req.flash('success', 'You are loged out!');
	res.redirect('/');
};


module.exports.ensureAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) {
		next();
		return;
	} else {
		req.flash('danger', 'You are not logged in');
		res.redirect('/');
	}
};

module.exports.forgot = async function(req, res, next){
	// see if the user exist
	const company = await Company.findOne({ "contacts.email": req.body.contacts['email'] });

	if(!company){
		req.flash('danger', 'No account with that emeil exists');
		return res.redirect('/company/login');
	}
	// set reset taken and expire time on ther account
	company.resetPasswordTaken = crypto.randomBytes(20).toString('hex');
	company.resetPasswordExpires = Date.now() + 3600000;

	await company.save();
	const resetURL = `http://${req.headers.host}/company/account/reset/${company.resetPasswordTaken}`;

	// Sending Reset By Nodemailer
	const transporter = nodemailer.createTransport({
		host: process.env.MAIL_HOST,
		port: process.env.MAIL_PORT,
		secure: false,
		auth: {
			user: process.env.MAIL_USER,
			pass: process.env.MAIL_PASS
		}
	});
	// turn pug to html 
	let generateHTML = (filename, options={})=> {
		let html = pug.renderFile(`${__dirname}/../views/${filename}.pug`, options);
		let inlined = juice(html);
		return inlined;
	};
	let html = generateHTML('email', { resetURL });
	let text = htmlToText.fromString(html);
	let mailOptions = {
		from: '"Mohamed Ashraf" <mohamedashrafothman@gmail.com>',
		to: company.contacts['email'],
		subject: 'Reset Password',
		html,
		text
	};
	await transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			return console.log(error);
		}
	});
	// await mail.send({
	// 	company,
	// 	subject: 'Password reset',
	// 	resetURL
	// });
	req.flash('success','You have been emailed a password reset link.');
	res.redirect('/company/forgot');
	// send them an email with the taken
	// redirect to the login page
};

module.exports.reset = async (req, res, next)=> {

	const company = await Company.findOne({
		resetPasswordTaken: req.params.token,
		resetPasswordExpires: {$gt: Date.now()}
	});
	if(!company){
		req.flash('danger', 'Password reset is invalid or has expired.');
		return res.redirect('/company/login');
	}
	res.render('resetPassword');
};

module.exports.confirmPassword = (req, res, next)=> {
	if (req.body.password === req.body['password-confirm']){
		next();
		return ;
	}
	req.flash('danger', 'passwords don\'t match!');
	res.redirect('back');
};

module.exports.update = async (req, res, next)=> {
	const newCompany = await Company.findOne({
		resetPasswordTaken: req.params.token,
		resetPasswordExpires: { $gt: Date.now() }
	});
	if (!newCompany) {
		req.flash('danger', 'Password reset is invalid or has expired.');
		return res.redirect('/company/login');
	}
	newCompany.resetPasswordTaken = undefined;
	newCompany.resetPasswordExpires= undefined;
	newCompany.password = req.body.password;
	
	Company.createCompany(newCompany, function (err, company) {
		if (err) throw err;
	});


	req.flash('success', 'You are now logged in with your new password!');
	res.redirect('/dashboard');
};
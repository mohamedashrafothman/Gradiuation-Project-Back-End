const passport      = require('passport');
const crypto        = require('crypto');
const mongoose      = require('mongoose');
const promisify     = require('es6-promisify');
const bcrypt        = require('bcryptjs');
const validator     = require('validator');
const localStrategy = require('passport-local').Strategy;
const nodemailer    = require('nodemailer');
const pug           = require('pug');
const juice         = require('juice');
const htmlToText    = require('html-to-text');
const User          = require('../models/user');
// Passport middleware functions
passport.use(new localStrategy(function (username, password, done) {
	User.getUsersByUsername(username, function (err, user) {
		if (err) throw err;
		if (!user) {
			return done(null, false, {
				message: 'Unkown User'
			});
		}
		User.comparePassword(password, user.password, function (err, isMatch) {
			if (err) throw err;
			if (isMatch) {
				return done(null, user);
			} else {
				return done(null, false, {
					message: 'Invalid Password'
				});
			}
		});
	});
}));
passport.serializeUser(function (user, done) {
	done(null, user.id);
});
passport.deserializeUser(function (id, done) {
	User.getUserById(id, function (err, user) {
		done(err, user);
	})
});

/**
 * 
 * Registeration Process: 
 *  	1- get registeration page that contains registeration form.
 * 	 	2- validate request body.
 * 		3- save the user into the database, then redirect to login page.
 * 
 */
module.exports.getAdminRegister = (req, res, next) => {
	res.render('auth/register/adminRegister');
};
module.exports.getUserRegister = (req, res, next) => {
	res.render('auth/register/userRegister');
};
module.exports.adminValidateRegister = (req, res, next) => {
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
	if (errors) {
		req.flash('danger', errors.map(err => err.msg));
		res.render('auth/register/adminRegister', {
			title: 'register',
			body: req.body,
			flashes: req.flash()
		});
		return;
	}
	next();
};
module.exports.userValidateRegister = (req, res, next) => {
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
	req.checkBody('gender', 'You must supply your gender').notEmpty();
	req.checkBody('photo', 'you must upload your photo').notEmpty();

	const errors = req.validationErrors();
	if (errors) {
		req.flash('danger', errors.map(err => err.msg));
		res.render('auth/register/userRegister', {
			title: 'register',
			body: req.body,
			flashes: req.flash()
		});
		return;
	}
	next();
};
module.exports.adminRegister = async (req, res, next) => {
	req.body.role = "admin";
	req.body.rating = 0;
	var newUser = await new User(req.body);
	User.createUser(newUser, function (err, user) {
		if (err) throw err;
	});
	req.flash('success', 'You are registered and can login as a company admin!');
	res.redirect('/');
};
module.exports.userRegister = async (req, res, next) => {
	req.body.role = "user";
	console.log(req.body);
	var newUser = await new User(req.body);
	User.createUser(newUser, function (err, user) {
		if (err){
			console.log(err);
			throw err;
		};
	});
	req.flash('success', 'You are registered and can login!');
	res.redirect('/');
};
/**
 * Login Process: 
 * 		1- get login page that contain login form. (done) 
 * 		2- setting up passport middleware that get user by user name and compare it's password with body password;
 */
module.exports.getLogin = (req, res, next) => {
	res.render('auth/login/login');
};
module.exports.login = passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: 'Invaled User',
	successFlash: 'Welcome Back!'
});
module.exports.logout = (req, res) => {
	req.logout();
	req.flash('success', 'You are loged out!');
	res.redirect('/');
};
module.exports.getForgot = (req, res, next) => {
	res.render('auth/reset/forgotPassword');
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
module.exports.forgot = async function (req, res, next) {
	// see if the user exist
	const user = await User.findOne({
		"contacts.email": req.body.contacts['email']
	});

	if (!user) {
		req.flash('danger', 'No account with that emeil exists');
		return res.redirect('/login');
	}
	// set reset taken and expire time on ther account
	user.resetPasswordTaken = crypto.randomBytes(20).toString('hex');
	user.resetPasswordExpires = Date.now() + 3600000;

	await user.save();
	const resetURL = `http://${req.headers.host}/user/account/reset/${user.resetPasswordTaken}`;

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
	let generateHTML = (filename, options = {}) => {
		let html = pug.renderFile(`${__dirname}/../views/auth/reset/${filename}.pug`, options);
		let inlined = juice(html);
		return inlined;
	};
	let html = generateHTML('email', {
		resetURL
	});
	let text = htmlToText.fromString(html);
	let mailOptions = {
		from: '"Mohamed Ashraf" <mohamedashrafothman@gmail.com>',
		to: user.contacts['email'],
		subject: 'Reset Password',
		html,
		text
	};
	await transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			return console.log(error);
		}
	});
	req.flash('success', 'You have been emailed a password reset link.');
	res.redirect('/forgot');
};
module.exports.reset = async (req, res, next) => {
	const user = await User.findOne({
		resetPasswordTaken: req.params.token,
		resetPasswordExpires: {
			$gt: Date.now()
		}
	});
	if (!user) {
		req.flash('danger', 'Password reset is invalid or has expired.');
		return res.redirect('/login');
	}
	res.render('auth/reset/resetPassword');
};
module.exports.confirmPassword = (req, res, next) => {
	if (req.body.password === req.body['password-confirm']) {
		next();
		return;
	}
	req.flash('danger', 'passwords don\'t match!');
	res.redirect('back');
};
module.exports.update = async (req, res, next) => {
	const newUser = await User.findOne({
		resetPasswordTaken: req.params.token,
		resetPasswordExpires: {
			$gt: Date.now()
		}
	});
	if (!newUser) {
		req.flash('danger', 'Password reset is invalid or has expired.');
		return res.redirect('/login');
	}
	newUser.resetPasswordTaken = undefined;
	newUser.resetPasswordExpires = undefined;
	newUser.password = req.body.password;
	User.createUser(newUser, function (err, user) {
		if (err) throw err;
	});
	req.flash('success', 'You are now logged in with your new password!');
	res.redirect('/');
};
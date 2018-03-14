const express = require('express');
const router = express.Router();
const companiesController = require('../controllers/companies');
const indexController = require('../controllers/index');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const Company = require('../models/company');
const authController = require('../controllers/auth');
// catch error function from errorHandelers file
const { catchErrors } = require('../handlers/errorHandlers');




// authentecation funcitons
passport.use(new localStrategy(function(username, password, done){
	Company.getCompaniesByUsername(username, function(err, company){
		if(err) throw err;
		if(!company){
			return done(null, false, {message: 'Unkown User'});
		}

		Company.comparePassword(password, company.password, function(err, isMatch){
			if(err) throw err; 
			if(isMatch){
				return done(null, company);
			} else {
				return done(null, false, {message: 'Invalid Password'});
			}
		});
	});
}));

passport.serializeUser(function(company, done) {
	done(null, company.id);
});

passport.deserializeUser(function(id, done){
	Company.getCompanyById(id, function (err, company) {
		done(err, company);
	})
});





router.post('/account/edit', authController.ensureAuthenticated,companiesController.upload,catchErrors(companiesController.resize),catchErrors(companiesController.updateCompany));
router.get('/account/edit', authController.ensureAuthenticated, catchErrors(companiesController.editCompany));
router.get('/login', companiesController.getLogin);
router.get('/register', companiesController.getRegister);
router.post('/register', companiesController.validateRegister, catchErrors(companiesController.register));
router.post('/login', authController.login, companiesController.login);
router.get('/forgot', companiesController.getForgot);
router.post('/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:token', catchErrors(authController.reset));
router.post('/account/reset/:token', authController.confirmPassword, catchErrors(authController.update));

router.get('/profile/:companyName', authController.ensureAuthenticated, catchErrors(companiesController.getProfile));
module.exports = router;
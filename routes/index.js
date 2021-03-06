const express         = require('express');
const router          = express.Router();
const indexController = require('../controllers/index');
const authController  = require('../controllers/auth');
const adminController = require('../controllers/admin');
const { requireRole } = require('../handlers/roleHandlers');
const { catchErrors } = require('../handlers/errorHandlers');


router.get('/', indexController.getHome);
router.get('/companies', (req, res)=> {res.redirect('/companies/1');});
router.get('/companies/:page', indexController.getCompanies);
router.get('/contact-us', indexController.getContactUs);
router.get('/shaaer/hajj', indexController.getHajj);
router.get('/shaaer/umrah', indexController.getUmrah);
router.get('/admin/register', authController.getAdminRegister);
router.get('/user/register', authController.getUserRegister);
router.post('/admin/register', authController.adminValidateRegister, catchErrors(authController.adminRegister));
router.post('/user/register', adminController.upload, catchErrors(adminController.resize), authController.userValidateRegister, catchErrors(authController.userRegister));
router.get('/login', authController.getLogin);
router.post('/login', authController.login);
router.get('/logout', authController.ensureAuthenticated, authController.logout);
router.get('/forgot', authController.getForgot);
router.post('/forgot', catchErrors(authController.forgot));
router.get('/user/account/reset/:token', catchErrors(authController.reset));
router.post('/user/account/reset/:token', authController.confirmPassword, catchErrors(authController.update));
router.get('/company/:company',catchErrors(indexController.getSingleCompany));
router.get('/trips/:page', catchErrors(indexController.getTrips));
router.get('/trips', (req, res) => {res.redirect('/trips/1');});
router.get('/trip/:trip', catchErrors(indexController.getSingleTrip));
router.post('/trip/request/:trip', requireRole('user'), catchErrors(indexController.requestTrip));
router.post('/reviews/:companyId', catchErrors(indexController.addReview));
router.get('/reviews/delete/:id', authController.ensureAuthenticated, requireRole("admin"), catchErrors(indexController.deleteReview));
router.get('/reviews/show/:id', authController.ensureAuthenticated, requireRole("admin"), catchErrors(indexController.showReview));



module.exports = router;
const express         = require('express');
const router          = express.Router();
const indexController = require('../controllers/index');
const authController  = require('../controllers/auth');
const { catchErrors } = require('../handlers/errorHandlers');


router.get('/', indexController.getHome);
router.get('/companies', indexController.getCompanies);
router.get('/contact-us', indexController.getContactUs);
router.get('/shaaer/hajj', indexController.getHajj);
router.get('/shaaer/umrah', indexController.getUmrah);
router.get('/admin/register', authController.getAdminRegister);
router.get('/user/register', authController.getUserRegister);
router.post('/admin/register', authController.adminValidateRegister, catchErrors(authController.adminRegister));
router.post('/user/register', authController.userValidateRegister, catchErrors(authController.userRegister));
router.get('/login', authController.getLogin);
router.post('/login', authController.login);
router.get('/logout', authController.ensureAuthenticated, authController.logout);
router.get('/forgot', authController.getForgot);
router.post('/forgot', catchErrors(authController.forgot));
router.get('/user/account/reset/:token', catchErrors(authController.reset));
router.post('/user/account/reset/:token', authController.confirmPassword, catchErrors(authController.update));
router.get('/company/:company', indexController.getSingleCompany);

module.exports = router;
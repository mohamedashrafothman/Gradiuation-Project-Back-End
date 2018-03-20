const express         = require('express');
const router          = express.Router();
const indexController = require('../controllers/index');
const authController  = require('../controllers/auth');

router.get('/',indexController.getHome);
router.get('/companies', indexController.getCompanies);
router.get('/logout', authController.logout);

module.exports = router;
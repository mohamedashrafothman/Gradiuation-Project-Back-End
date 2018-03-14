const express         = require('express');
const router          = express.Router();
const indexController = require('../controllers/index');
const authController  = require('../controllers/auth');

router.get('/',indexController.getHome);
router.get('/dashboard',indexController.getDashboard);
router.get('/logout', authController.logout);

module.exports = router;
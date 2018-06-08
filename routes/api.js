const express         = require('express');
const router          = express.Router();
const indexController = require('../controllers/index');
const authController  = require('../controllers/auth');
const apiController   = require('../controllers/api.js');
const { requireRole } = require('../handlers/roleHandlers');
const { catchErrors } = require('../handlers/errorHandlers');


router.get('/company',
	catchErrors(apiController.getCompanies));
router.get('/company/:company',
	catchErrors(apiController.getCompany));
router.get('/company/:company/trips',
	catchErrors(apiController.getCompanyTrips));
router.get('/company/:company/trips/:trip',
	catchErrors(apiController.getCompanySingleTrip));
router.get('/trips',
	catchErrors(apiController.getTrips));
router.get('/home',
	catchErrors(apiController.getHomePAge));

	
module.exports = router;
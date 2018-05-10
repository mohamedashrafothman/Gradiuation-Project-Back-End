const express         = require('express');
const router          = express.Router();
const indexController = require('../controllers/index');
const authController  = require('../controllers/auth');
const apiController   = require('../controllers/api.js');
const { requireRole } = require('../handlers/roleHandlers');
const { catchErrors } = require('../handlers/errorHandlers');


router.get('/companies', catchErrors(apiController.getCompanies));
router.get('/company/:company', catchErrors(apiController.getcompany));
router.get('/trips', catchErrors(apiController.getTrips));

module.exports = router;
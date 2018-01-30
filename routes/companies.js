const express = require('express');
const router = express.Router();
const companiesController = require('../controllers/companies');
// catch error function from errorHandelers file
const { catchErrors } = require('../handlers/errorHandlers');


router.get('/', catchErrors(companiesController.getCompanies));
router.get('/add', companiesController.addCompany);
router.post('/add',
	companiesController.upload,
	catchErrors(companiesController.resize),
	catchErrors(companiesController.createCompany));
router.post('/add/:id', 
	companiesController.upload,
	catchErrors(companiesController.resize),
	catchErrors(companiesController.updateCompany));
router.get('/edit/:id', catchErrors(companiesController.editCompany));
router.get('/delete/:id', catchErrors(companiesController.deleteCompany));

module.exports = router;
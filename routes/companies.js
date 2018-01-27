const express = require('express');
const router = express.Router();
const companiesController = require('../controllers/companies');
const { catchErrors } = require('../handlers/errorHandlers');


router.get('/', companiesController.getCompanies);
router.get('/add', companiesController.addCompany);
router.post('/add', companiesController.createCompany);
router.post('/add/:id', companiesController.updateCompany);
router.get('/edit/:id', companiesController.editCompany);
router.get('/delete/:id', companiesController.deleteCompany);

module.exports = router;
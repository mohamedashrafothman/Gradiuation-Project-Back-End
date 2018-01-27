const express = require('express');
const router = express.Router();
const apiController = require('../controllers/api');

router.get('/companies', apiController.getCompanies);
// router.post('/companies/add', apiController.getCompanies);


module.exports = router;
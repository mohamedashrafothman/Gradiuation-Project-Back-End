/**
 * requiring dependencies
 */
const router = require('express').Router();
const indexConteoller = require('../controllers/index');

router.get('/', indexConteoller.index);

module.exports = router;
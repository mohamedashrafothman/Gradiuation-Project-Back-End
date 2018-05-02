const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const authController = require('../controllers/auth');
const { requireRole } = require('../handlers/roleHandlers');
const { catchErrors } = require('../handlers/errorHandlers');


router.get('/', authController.ensureAuthenticated, requireRole("admin"), catchErrors(adminController.getDashboard));
router.get('/profile/:userName', authController.ensureAuthenticated, requireRole("admin"), catchErrors(adminController.getProfile));
router.get('/profile/:userName/edit', authController.ensureAuthenticated, requireRole("admin"), catchErrors(adminController.editUser));
router.post('/profile/:userName/edit', authController.ensureAuthenticated, requireRole("admin"), adminController.upload,catchErrors(adminController.resize),catchErrors(adminController.updateUser));


// trips module
router.get('/trips', authController.ensureAuthenticated, requireRole("admin") ,catchErrors(adminController.getTrips));
router.get('/trips/add', authController.ensureAuthenticated, requireRole("admin"), catchErrors(adminController.getTrip));
router.post('/trips/add', authController.ensureAuthenticated, requireRole("admin"), catchErrors(adminController.addTrip));
router.post('/trip/update/:id', authController.ensureAuthenticated, requireRole("admin"), catchErrors(adminController.updateTrip));
router.get('/trips/delete/:id', authController.ensureAuthenticated, requireRole("admin"), catchErrors(adminController.deleteTrip));


module.exports = router;
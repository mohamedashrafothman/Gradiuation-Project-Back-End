const express         = require('express');
const router          = express.Router();
const adminController = require('../controllers/admin');
const authController  = require('../controllers/auth');
const {requireRole}   = require('../handlers/roleHandlers');
const {catchErrors}   = require('../handlers/errorHandlers');

router.get('/',
	authController.ensureAuthenticated,
	requireRole("admin"),
	catchErrors(adminController.getDashboard));
router.get('/profile/:userName',
	authController.ensureAuthenticated,
	requireRole("admin"),
	catchErrors(adminController.getProfile));
router.get('/profile/:userName/edit',
	authController.ensureAuthenticated,
	requireRole("admin"),
	catchErrors(adminController.editUser));
router.post('/profile/:userName/edit',
	authController.ensureAuthenticated,
	requireRole("admin"),
	adminController.upload,
	catchErrors(adminController.resize),
	catchErrors(adminController.updateUser));

// trips Routes
router.get('/trips',
	authController.ensureAuthenticated,
	requireRole("admin"),
	catchErrors(adminController.getTrips));
router.get('/trips/add',
	authController.ensureAuthenticated,
	requireRole("admin"),
	catchErrors(adminController.getTrip));
router.post('/trips/add',
	authController.ensureAuthenticated,
	requireRole("admin"),
	catchErrors(adminController.addTrip));
router.get('/trip/update/:id',
	authController.ensureAuthenticated,
	requireRole('admin'),
	catchErrors(adminController.editTrip));
router.post('/trip/update/:id',
	authController.ensureAuthenticated,
	requireRole("admin"),
	catchErrors(adminController.updateTrip));
router.get('/trips/delete/:id',
	authController.ensureAuthenticated,
	requireRole("admin"),
	catchErrors(adminController.deleteTrip));
router.get('/trips/show/:id',
	authController.ensureAuthenticated,
	requireRole("admin"),
	catchErrors(adminController.activateTrip));

// reviews Routes
router.get('/reviews',
	authController.ensureAuthenticated,
	requireRole('admin'),
	catchErrors(adminController.getReviews));

// requests Routes
router.get('/requests',
	authController.ensureAuthenticated,
	requireRole('admin'),
	catchErrors(adminController.getRequests));
router.get('/requests/accept/:id',
	authController.ensureAuthenticated,
	requireRole('admin'),
	adminController.acceptRequest);
router.get('/requests/wait/:id',
	authController.ensureAuthenticated,
	requireRole('admin'),
	adminController.waitRequest);
router.get('/requests/reject/:id',
	authController.ensureAuthenticated,
	requireRole('admin'),
	adminController.rejectRequest);

module.exports = router;
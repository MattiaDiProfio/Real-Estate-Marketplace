const express = require('express');
const router = express.Router({ mergeParams : true});
const catchAsyncError = require('../utils/catchAsyncError');
const Property = require('../models/property');
const Viewing = require('../models/viewing');
const { isLoggedIn } = require('../middleware');
const viewingsController = require('../controllers/viewings');

// Place a new booking request on behalf of user in session
router.post('/' , isLoggedIn, catchAsyncError( viewingsController.placeViewing ));

// Delete booking appointment on behalf of user in session
router.delete('/', viewingsController.cancelViewing )

module.exports = router;
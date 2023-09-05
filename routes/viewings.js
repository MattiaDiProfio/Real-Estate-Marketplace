const express = require('express');
const router = express.Router({ mergeParams : true});
const catchAsyncError = require('../utils/catchAsyncError');
const Property = require('../models/property');
const Viewing = require('../models/viewing');
const { isLoggedIn } = require('../middleware');

const viewingsController = require('../controllers/viewings');

router.post('/' , isLoggedIn, catchAsyncError( viewingsController.placeViewing ));

module.exports = router;
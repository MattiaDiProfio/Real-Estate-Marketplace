const express = require('express');
const router = express.Router();
const catchAsyncError = require('../utils/catchAsyncError');
const Property = require('../models/property');
const {validateProperty, isLoggedIn, isLandlord} = require('../middleware');
const ExpressError = require('../utils/ExpressError');
const propertiesController = require('../controllers/properties');


router.route('/')
    .get( catchAsyncError( propertiesController.showAllListings ))
    .post( validateProperty, isLoggedIn, catchAsyncError( propertiesController.createListing ));

//serve the form to create new property
router.get('/new', isLoggedIn, propertiesController.serveLoginForm )

router.route('/search')
    .get( propertiesController.serveSearchForm )
    .post( catchAsyncError( propertiesController.searchListings ));

// render a more detailed view of a single property
router.route('/:id')
    .get( catchAsyncError( propertiesController.showListing ))
    .delete( isLoggedIn, isLandlord, catchAsyncError( propertiesController.deleteListing ));

router.route('/:id/edit')
    .get( isLoggedIn, catchAsyncError( propertiesController.serveEditForm ))
    .put( isLoggedIn, isLandlord, catchAsyncError( propertiesController.editListing ));

router.put('/:id/toggleLike', propertiesController.toggleLike );

module.exports = router;
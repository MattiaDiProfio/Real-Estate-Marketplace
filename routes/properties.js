const express = require('express');
const router = express.Router();
const catchAsyncError = require('../utils/catchAsyncError');
const Property = require('../models/property');
const {validateProperty, isLoggedIn, isLandlord} = require('../middleware');
const ExpressError = require('../utils/ExpressError');
const propertiesController = require('../controllers/properties');
 
// Setup Multer npm package to facilitate image upload process
const multer = require('multer');
const { storage } = require('../cloudinary/index');
const upload = multer({ storage });

router.route('/')
    // Show all property listings on the database
    .get( catchAsyncError( propertiesController.showAllListings ))
    // Create a new property listing using the payload from the New-Property form
    .post( upload.array('image'), validateProperty, isLoggedIn, catchAsyncError( propertiesController.createListing ));

// Serve the form to create new property
router.get('/new', isLoggedIn, propertiesController.serveLoginForm )

router.route('/search')
    // Serve the search form to look for properties on the app
    .get( propertiesController.serveSearchForm )
    // Send a POST request with the filter criteria given by the user
    .post( catchAsyncError( propertiesController.searchListings ));

router.route('/:id')
    // Serve a property's detailed view, given its id
    .get( catchAsyncError( propertiesController.showListing ))
    // Delete a property and its listing from the database given its id
    .delete( isLoggedIn, isLandlord, catchAsyncError( propertiesController.deleteListing ));

router.route('/:id/edit')
    // Serve the edit form for a property - property landlord only
    .get( isLoggedIn, catchAsyncError( propertiesController.serveEditForm ))
    // Send a PUT request to update the property using the above form payload
    .put( isLoggedIn, isLandlord, upload.array('image'), catchAsyncError( propertiesController.editListing ));

// Toggle the like button on a property
router.put('/:id/toggleLike', propertiesController.toggleLike );

module.exports = router;
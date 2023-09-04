const express = require('express');
const router = express.Router();
const catchAsyncError = require('../utils/catchAsyncError');
const Property = require('../models/property');
const {validateProperty} = require('../middleware');
const ExpressError = require('../utils/ExpressError');

// render a view of all properties
router.get('/', catchAsyncError(async (req, res) => {
    const allProperties = await Property.find({});
    res.render('properties/index', { allProperties, calledFromNavbar : true });
}));

//serve the form to create new property
router.get('/new', (req, res) => {
    res.render('properties/new');
})

//serve form to allow user to perform a personal search of listings
router.get('/search', (req, res) => res.render('properties/search'));

router.post('/search', catchAsyncError(async (req, res) => {
    let { city, minRooms, maxRooms, order } = req.body.filterParams;
    city = city ? city : { $gt : '' } // select all cities if an address is not given
    minRooms = Math.min(minRooms, maxRooms);
    maxRooms = Math.max(minRooms, maxRooms);
    let sortingCondition;
    switch (order) {
        case 'rentLowHigh' :
            sortingCondition = { monthlyRent : 1 };
            break;
        case 'rentHighLow' :
            sortingCondition = { monthlyRent : -1 };
            break;
        case 'roomsLowHigh' :
            sortingCondition = { numberRooms : 1 };
            break;
        case 'roomsHighLow' :
            sortingCondition = { numberRooms : - 1};
            break;
    }
    let allProperties = await Property.find({
        city : city,
        numberRooms : { $gte : Number(minRooms), $lte : Number(maxRooms) }
    }).sort(sortingCondition);

    res.render('properties/index', { allProperties, calledFromNavbar : false });
}));


// render a more detailed view of a single property
router.get('/:id', catchAsyncError(async(req, res) => {
    const { id } = req.params;
    const property = await Property.findById(id).populate('viewings');
    res.render('properties/show', { property });
}));

// serve form to edit a specific route
router.get('/:id/edit', catchAsyncError(async (req, res) => {
    const { id } = req.params;
    const property = await Property.findById(id);
    res.render('properties/edit', { property });
}));

// post new property info to the db
router.post('/', validateProperty, catchAsyncError(async (req, res) => {
    const newProperty = new Property(req.body.property);
    newProperty.availableViewings = generateAvailableViewings();
    await newProperty.save();
    req.flash('success', 'Listing created successfully');
    res.redirect(`/properties/${newProperty._id}`);
}));

// edit property using data from the edit form
router.put('/:id/edit', catchAsyncError(async(req, res) => {
    const { id } = req.params;
    const property = await Property.findByIdAndUpdate(id, { ...req.body.property }, { new : true });
    await property.save();
    req.flash('success', 'Listing updated successfully');
    res.redirect(`/properties/${property._id}`)
}));

// delete property from db
router.delete('/:id', catchAsyncError(async(req, res) => {
    const { id } = req.params;
    await Property.findByIdAndDelete(id);
    req.flash('success', 'Listing deleted successfully');
    res.redirect('/properties');
}));

module.exports = router;
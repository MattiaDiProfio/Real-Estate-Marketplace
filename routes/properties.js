const express = require('express');
const router = express.Router();
const catchAsyncError = require('../utils/catchAsyncError');
const Property = require('../models/property');
const {validateProperty, isLoggedIn, isLandlord} = require('../middleware');
const ExpressError = require('../utils/ExpressError');


const getRandomDate = () => {
    const currentDate = new Date();
    const futureDate = new Date(currentDate);
    const randomDaysToAdd = Math.floor(Math.random() * 60) + 1;
    futureDate.setDate(currentDate.getDate() + randomDaysToAdd);
    const day = String(futureDate.getDate()).padStart(2, '0');
    const month = String(futureDate.getMonth() + 1).padStart(2, '0');
    const year = futureDate.getFullYear();
    return `${day}/${month}/${year}`;
}
const generateAvailableViewings = () => {
    let randomUKDates = [];
    for (let i = 0; i < 10; i++) {
        const randomDate = getRandomDate();
        randomUKDates.push(randomDate);
    }
    return randomUKDates;
}


// render a view of all properties
router.get('/', catchAsyncError(async (req, res) => {
    const allProperties = await Property.find({});
    res.render('properties/index', { allProperties, calledFromNavbar : true });
}));

//serve the form to create new property
router.get('/new', isLoggedIn, (req, res) => {
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
    const property = await Property.findById(id).populate('viewings').populate('landlord');
    res.render('properties/show', { property });
}));

// serve form to edit a specific route
router.get('/:id/edit', isLoggedIn, catchAsyncError(async (req, res) => {
    const { id } = req.params;
    const property = await Property.findById(id);
    res.render('properties/edit', { property });
}));

// post new property info to the db
router.post('/', validateProperty, isLoggedIn, catchAsyncError(async (req, res) => {
    const newProperty = new Property(req.body.property);
    newProperty.landlord = req.user._id;
    newProperty.availableViewings = generateAvailableViewings();
    await newProperty.save();
    req.flash('success', 'Listing created successfully');
    res.redirect(`/properties/${newProperty._id}`);
}));

// edit property using data from the edit form
router.put('/:id/edit', isLoggedIn, isLandlord, catchAsyncError(async (req, res) => {
    const prop = await Property.findByIdAndUpdate(id, { ...req.body.property }, { new : true });
    await prop.save();
    req.flash('success', 'Listing updated successfully');
    res.redirect(`/properties/${prop._id}`)
}));

// delete property from db
router.delete('/:id', isLoggedIn, isLandlord, catchAsyncError(async(req, res) => {
    const { id } = req.params;
    await Property.findByIdAndDelete(id);
    req.flash('success', 'Listing deleted successfully');
    res.redirect('/properties');
}));

module.exports = router;
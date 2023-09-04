const express = require('express');
const router = express.Router({ mergeParams : true});
const catchAsyncError = require('../utils/catchAsyncError');
const Property = require('../models/property');
const Viewing = require('../models/viewing');


router.post('/' , catchAsyncError(async (req, res) => {

    const { id } = req.params;
    const { date } = req.body.viewing;

    //find the listing where the booking was requested from
    const property = await Property.findById(id)

    const viewing = new Viewing();
    viewing.date = date;


    property.viewings.push(viewing);
    property.availableViewings.splice(property.availableViewings.indexOf(date), 1);

    await viewing.save();
    await property.save();

    req.flash('success', 'Viewing booked successfully');
    res.redirect(`/properties/${property._id}`)
}))

module.exports = router;
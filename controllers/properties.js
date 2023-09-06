const Property = require('../models/property');
const { generateAvailableViewings } = require('../utils/generateDates');
const User = require('../models/user');
const user = require('../models/user');

module.exports.showAllListings = async (req, res) => {
    const allProperties = await Property.find({});
    res.render('properties/index', { allProperties, calledFromNavbar : true });
}

module.exports.serveLoginForm = (req, res) => res.render('properties/new');

module.exports.serveSearchForm = (req, res) => res.render('properties/search')

module.exports.searchListings = async (req, res) => {
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
}

module.exports.showListing = async(req, res) => {
    const { id } = req.params;
    const property = await Property.findById(id).populate('viewings').populate('landlord');
    res.render('properties/show', { property });
}

module.exports.serveEditForm = async (req, res) => {
    const { id } = req.params;
    const property = await Property.findById(id);
    res.render('properties/edit', { property });
}

module.exports.createListing = async (req, res) => {
    const newProperty = new Property(req.body.property);
    newProperty.landlord = req.user._id;
    newProperty.availableViewings = generateAvailableViewings();
    await newProperty.save();
    req.flash('success', 'Listing created successfully');
    res.redirect(`/properties/${newProperty._id}`);
}

module.exports.editListing = async (req, res) => {
    const { id } = req.params;
    const prop = await Property.findByIdAndUpdate(id, { ...req.body.property }, { new : true });
    await prop.save();
    req.flash('success', 'Listing updated successfully');
    res.redirect(`/properties/${prop._id}`)
}

module.exports.deleteListing = async(req, res) => {
    const { id } = req.params;
    await Property.findByIdAndDelete(id);
    req.flash('success', 'Listing deleted successfully');
    res.redirect('/properties');
}

module.exports.toggleLike = async(req, res) => {
    const propertyID = req.params.id;
    const { userID } = req.query;

    const user = await User.findById(userID);
    const indexOfProperty = user.likedListings.indexOf(propertyID);

    if (indexOfProperty == -1) user.likedListings.push(propertyID);
    else user.likedListings.splice(indexOfProperty, 1);
    
    /**
        / check if the propertyID is in the user's liked property
        / if yes then remove it otherwise add it 
        make sure that when a property is deleted from the db it is removed from all the likedProperty lists (use a post schema middleware)
        / change the icon on the show page based upon the status
        / display listing in card on the dashboard
     */

    await user.save();
    res.redirect(`/properties/${propertyID}`);
}
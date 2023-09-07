const Property = require('../models/property');
const { generateAvailableViewings } = require('../utils/generateDates');
const User = require('../models/user');

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding'); 
const mapBoxToken = "";
const geoCoder = mbxGeocoding({ accessToken : mapBoxToken });

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

    const geoData = await geoCoder.forwardGeocode({
        query : `${req.body.city}`,
        limit : 1
    }).send()

    const userID = req.user._id
    const newProperty = new Property(req.body.property);
    const landlord = await User.findById(userID);
    newProperty.landlord = userID;
    newProperty.geometry = geoData.body.features[0].geometry;
    newProperty.availableViewings = generateAvailableViewings();
    landlord.myListings.push(newProperty._id);
    await newProperty.save();
    await landlord.save();
    req.flash('success', 'Listing created successfully');
    res.redirect(`/properties/${newProperty._id}`);
    res.send('ok!');
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
    const userID = req.user._id;
    const landlord = await User.findById(userID);
    landlord.myListings.splice(landlord.myListings.indexOf(id), 1);
    await Property.findByIdAndDelete(id);
    await landlord.save();
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
    
    await user.save();
    res.redirect(`/properties/${propertyID}`);
}
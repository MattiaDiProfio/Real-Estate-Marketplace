const Property = require('../models/property');
const User = require('../models/user');
const { generateAvailableViewings } = require('../utils/generateDates');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding'); 
const mapBoxToken = "pk.eyJ1IjoibWF0dGlhZGlwcm9maW8xIiwiYSI6ImNsbG54ZXdjZjA1ZWwzZm1xYmM2YTlzd3EifQ.OXFg-nuVZkEHCXeCp5mqkw";
const geoCoder = mbxGeocoding({ accessToken : mapBoxToken });

/* 
   Render all property listings, if control variable 'calledFromNavbar' is true 
   then what is being loaded into the ejs template are the listings which adhere to 
   the search criterias imposed by the user
*/
module.exports.showAllListings = async (req, res) => {
    const allProperties = await Property.find({});
    res.render('properties/index', { allProperties, calledFromNavbar : true });
}

// Render user login form
module.exports.serveLoginForm = (req, res) => res.render('properties/new');

// Render user signup form
module.exports.serveSearchForm = (req, res) => res.render('properties/search')

// Eetrieve all listings which satisfy user-imposed criteria
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

// Search and return property listing where id matches request id
module.exports.showListing = async(req, res) => {
    const { id } = req.params;
    const property = await Property.findById(id).populate('viewings').populate('landlord');
    res.render('properties/show', { property });
}

// Render the edit form for a property when landlord decides to edit listing details
module.exports.serveEditForm = async (req, res) => {
    const { id } = req.params;
    const property = await Property.findById(id);
    res.render('properties/edit', { property });
}

// Create a new property listing using request payload 
module.exports.createListing = async (req, res) => {
    
    // Configure geo-JSON for the city associated with the listing
    const geoData = await geoCoder.forwardGeocode({
        query : `${req.body.city}`,
        limit : 1
    }).send()

    // Create Property instance and update Landlord instance
    const userID = req.user._id
    const newProperty = new Property(req.body.property);
    const landlord = await User.findById(userID);
    newProperty.landlord = userID;
    newProperty.images = req.files.map(f => ({ url : f.path, filename : f.filename }));
    newProperty.geometry = geoData.body.features[0].geometry;
    newProperty.availableViewings = generateAvailableViewings();
    landlord.myListings.push(newProperty._id);

    await newProperty.save();
    await landlord.save();

    // Flash temporary pop-up message to screen to notify user of update
    req.flash('success', 'Listing created successfully');
    res.redirect(`/properties/${newProperty._id}`);
}

// Update a listing's details using data from request payload
module.exports.editListing = async (req, res) => {
    const { id } = req.params;

    // Fetch the Property instance using the property ID from within request
    const prop = await Property.findByIdAndUpdate(id, { ...req.body.property }, { new : true });
    const images = req.files.map(f => ({ url : f.path, filename : f.filename }))
    prop.images.push(...images);

    // Delete all listing images which have been selected for removal through the 'edit' template
    if (req.body.deleteImages) {
        for(let filename of req.body.deleteImages) await cloudinary.uploader.destroy(filename);
        await prop.updateOne({ $pull : { images : { filename : { $in : req.body.deleteImages } } } })
    }

    // Save changes and flash temporary pop-up message to screen to notify user of update
    await prop.save();
    req.flash('success', 'Listing updated successfully');
    res.redirect(`/properties/${prop._id}`)
}

// Delete a property listing given a database entry with matching ID is found
module.exports.deleteListing = async(req, res) => {
    const { id } = req.params;

    // Find landlord and update their list of properties in database
    const userID = req.user._id;
    const landlord = await User.findById(userID);
    landlord.myListings.splice(landlord.myListings.indexOf(id), 1);

    // Delete the property instance
    await Property.findByIdAndDelete(id);
    await landlord.save();

    // Flash temporary pop-up message to screen to notify user of update
    req.flash('success', 'Listing deleted successfully');
    res.redirect('/properties');
}

// Toggle like button on any given listing - triggered by user click
module.exports.toggleLike = async(req, res) => {
    const propertyID = req.params.id;
    const { userID } = req.query;

    // Fetch user currently in session
    const user = await User.findById(userID);
    const indexOfProperty = user.likedListings.indexOf(propertyID);

    // Add or remove property from user's liked listing 
    if (indexOfProperty == -1) user.likedListings.push(propertyID);
    else user.likedListings.splice(indexOfProperty, 1);
    
    await user.save();
    res.redirect(`/properties/${propertyID}`);
}

const Property = require('../models/property');
const User = require('../models/user');
const Viewing = require('../models/viewing');

// Register property viewing appointment 
module.exports.placeViewing = async (req, res) => {

    const { id } = req.params;
    const { date } = req.body.viewing;
    const { userID } = req.query;

    // Find the listing where the booking was requested from and the session user
    const property = await Property.findById(id);
    const user = await User.findById(userID).populate('upcomingViewings');
    const landlord = await User.findById(property.landlord._id);

    // Create new Viewing instance and set its attributes
    const viewing = new Viewing();
    viewing.date = date;
    viewing.requestedBy = req.user._id;
    viewing.property = property._id;

    // Connect the viewing with the property, user, and property landlord 
    property.viewings.push(viewing);
    property.availableViewings.splice(property.availableViewings.indexOf(date), 1);
    user.upcomingViewings.push(viewing);
    landlord.upcomingViewings.push(viewing);

    // Save all changed to database
    await landlord.save();
    await viewing.save();
    await property.save();
    await user.save();

    // Flash temporary pop-up message to screen to notify user of update
    req.flash('success', 'Viewing booked successfully');
    res.redirect(`/properties/${property._id}`)
}

// Remove property viewing appointment
module.exports.cancelViewing = async(req, res) => {
    const propertyID = req.params.id;
    const { viewingID, userID } = req.query;

    // Fetch all entities involved - property, user, landlord
    const user = await User.findById(userID);
    const viewing = await Viewing.findById(viewingID);
    const property = await Property.findById(propertyID);

    // Find and remove viewing from user's list of booked viewings
    const viewingIndex = user.upcomingViewings.indexOf(viewingID);
    user.upcomingViewings.splice(viewingIndex, 1);

    // Retunrn viewing slot to the property listing
    const newViewing = new Viewing({ date : viewing.date , requestedBy : userID, property : propertyID });
    property.availableViewings.push(newViewing.date);
    property.viewings.splice(property.viewings.indexOf(viewingID), 1);
    await Viewing.findByIdAndDelete(viewingID);

    // Save changes to database
    await user.save();
    await property.save();
    await newViewing.save();

    // Flash temporary pop-up message to screen to notify user of update
    req.flash('success', 'Viewing appointment cancelled');
    res.redirect(`/auth/${userID}/dashboard`);
}
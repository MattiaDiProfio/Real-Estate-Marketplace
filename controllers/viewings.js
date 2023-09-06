const Property = require('../models/property');
const User = require('../models/user');
const Viewing = require('../models/viewing');

module.exports.placeViewing = async (req, res) => {

    const { id } = req.params;
    const { date } = req.body.viewing;
    const { userID } = req.query;

    //find the listing where the booking was requested from
    const property = await Property.findById(id);
    const user = await User.findById(userID);

    const viewing = new Viewing();
    viewing.date = date;
    viewing.requestedBy = req.user._id;
    viewing.property = property._id;

    property.viewings.push(viewing);
    property.availableViewings.splice(property.availableViewings.indexOf(date), 1);
    user.upcomingViewings.push(viewing);

    await viewing.save();
    await property.save();
    await user.save();

    req.flash('success', 'Viewing booked successfully');
    res.redirect(`/properties/${property._id}`)
}

module.exports.cancelViewing = async(req, res) => {
    const propertyID = req.params.id;
    const { viewingID, userID } = req.query;

    const user = await User.findById(userID);
    const viewing = await Viewing.findById(viewingID);
    const property = await Property.findById(propertyID);

    const viewingIndex = user.upcomingViewings.indexOf(viewingID);
    user.upcomingViewings.splice(viewingIndex, 1);

    const newViewing = new Viewing({ date : viewing.date , requestedBy : userID, property : propertyID });

    // property.viewings.push(newViewing.date);
    // property.availableViewings.splice(property.availableViewings.indexOf(newViewing.date), 1);

    property.availableViewings.push(newViewing.date);
    property.viewings.splice(property.viewings.indexOf(viewingID), 1);

    // get current user 
    // get property id associated with viewing
    // remove viewingID from the user's upcomingViewings
    // add new viewing with the date of the one deleted to the available viewings on the property
    // flash message 
    // redirect to user dashboard 
    //test when property is deleted by admin if both the likedListing and upcomingViewings arrays on the user object are updated

    await Viewing.findByIdAndDelete(viewingID);
    await user.save();
    await property.save();
    await newViewing.save();

    req.flash('success', 'Viewing appointment cancelled');
    res.redirect(`/auth/${userID}/dashboard`);
}
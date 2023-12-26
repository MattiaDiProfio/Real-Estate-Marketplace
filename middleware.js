const { propertySchema } = require('./schemas');
const Property = require('./models/property');

// Middleware used to validate the payload for the creation and editing of property data
module.exports.validateProperty = (req, res, next) => {
    // Validate form data
    let {error} = propertySchema.validate(req.body);
    if (error) {
        let errorMessage = error.details.map(err => err.message.join(', '));
        throw new ExpressError(errorMessage, 400);
    }
    // Advance to the next middleware specified in middleware chain
    else next();
}

// Middleware ensures that user is logged in before interacting with the application
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        // Return error message in the form of a flash message
        req.flash('error', 'sign-in required')
        res.render('users/login');
    } 
    // Advance to the next middleware specified in middleware chain
    else next();
}

// Middleware stores the route user is trying to access before auth action triggered
module.exports.storeReturnTo = (req, res, next) => {
    // Return to the saved route 
    if (req.session.returnTo) res.locals.returnTo = req.session.returnTo;
    // Advance to the next middleware specified in middleware chain
    next();
}

// Middleware ensures user logged in is a landlord of the property they are interacting with
module.exports.isLandlord = async (req, res, next) => {
    const { id } = req.params;
    const property = await Property.findById(id);
    // Protect this route when author is not logged in
    if (!property.landlord.equals(req.user._id)) {
        req.flash('error', 'Author credentials required');
        return res.redirect(`/properties/${property._id}`)
    } 
    // Advance to the next middleware specified in middleware chain
    next();
}
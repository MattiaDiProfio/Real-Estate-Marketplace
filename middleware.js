const { propertySchema } = require('./schemas');
const Property = require('./models/property');


module.exports.validateProperty = (req, res, next) => {
    //validate form data
    let {error} = propertySchema.validate(req.body);
    if (error) {
        let errorMessage = error.details.map(err => err.message.join(', '));
        throw new ExpressError(errorMessage, 400);
    }
    else next(); //proceed to the next middleware
}

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'sign-in required')
        res.render('users/login');
    } else next();
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.isLandlord = async (req, res, next) => {
    const { id } = req.params;
    const property = await Property.findById(id);
    //protect this route when author is not logged in
    if (!property.landlord.equals(req.user._id)) {
        req.flash('error', 'Author credentials required');
        return res.redirect(`/properties/${property._id}`)
    } 
    next();
}
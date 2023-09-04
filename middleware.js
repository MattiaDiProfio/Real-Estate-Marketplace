const { propertySchema } = require('./schemas');

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
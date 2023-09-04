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
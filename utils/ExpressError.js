// Class to model ExpressJS errors
class ExpressError extends Error {
    constructor(message, statusCode) {
        // Inherits from JavaScript's native error class
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError; 
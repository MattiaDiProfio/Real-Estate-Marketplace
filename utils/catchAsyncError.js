// Utility function with purpose of catching and handling async errors
const catchAsyncError = func => {
    return (req, res, next) => {
        // return a promist and execute the 'next' middlware
        func(req, res, next).catch(next);
    }
}

module.exports = catchAsyncError; 
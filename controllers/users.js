const User = require('../models/user');
const Property = require('../models/property');
const passport = require('passport');
const Viewing = require('../models/viewing');

// Render user signup form
module.exports.serveSignupForm = (req, res) => res.render('users/signup');

// Render user login form
module.exports.serveLoginForm = (req, res) => res.render('users/login');

// Register new user with data from request payload/signup form
module.exports.registerUser = async (req, res, next) => {
    try {
        // Extract credentials and create User model instance
        const { email, username, password, isLandlord = false } = req.body.signup;
        const user = new User({ email, username, isLandlord });
        const registeredUser = await User.register(user, password);

        // Login user directly after signup
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to PropertEase!');
            res.redirect('/properties');
        });

    } catch (e) {
        req.flash('error', e.message);
        res.redirect('login');
    }
}

// Login current user
module.exports.loginUser = (req, res) => {
    req.flash('success', 'Welcome back!');
    // Redirect user to visited page before prompted for signup/login action
    const redirectUrl = res.locals.returnTo || '/properties';
    res.redirect(redirectUrl);
}

// Logout current user
module.exports.logoutUser = (req, res, next) => {
    req.logout(function (err) {
        // Trigger execution of following middleware function
        if (err) return next(err); 
        req.flash('success', 'Logout successfull');
        res.redirect('/properties');
    });
}

// Render details of user logged into current session from MongoDB
module.exports.showUserDashboard = async (req, res) => {
    const { id } = req.params;

    // Use the 'populate' method to fetch data related to user
    const user = await User.findById(id)
        .populate({path : 'myListings', populate : { path : 'viewings', populate : [{path : 'date'}, {path : 'requestedBy', populate : {path : 'username'}}, {path : 'property'}] }})
        .populate({path : 'upcomingViewings', populate : [{ path : 'property' }, { path : 'requestedBy'}]})
        .populate('likedListings');

    // Render user dashboard with the previously fetched data
    res.render('users/dashboard', { user });
};

// Delete user account
module.exports.deleteAccount = async(req, res) => {
    const userID = req.params.id;
    const user = await User
        .findById(userID)
        .populate({ 
            path : 'upcomingViewings', 
            populate : [{ path : 'date' }, { path : 'property'}]
        })

    // Return all dates to properties for which user had a booking registered
    for (let viewing of user.upcomingViewings) {
        const date = viewing.date;
        const property = await Property.findById(viewing.property._id).populate('availableViewings');
        const newViewing = new Viewing({ date, property : property._id });
        await newViewing.save();
        property.availableViewings.push(newViewing._id);
        await property.save();
    }

    // Remove user from database 
    await User.findByIdAndDelete(userID);

    // Flash temporary pop-up message to screen to notify user of update
    req.flash('success', 'Your account was successfully deleted');
    res.redirect('/properties');
}
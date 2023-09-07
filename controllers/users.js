const User = require('../models/user');
const Property = require('../models/property');
const passport = require('passport');
const Viewing = require('../models/viewing');

module.exports.serveSignupForm = (req, res) => res.render('users/signup')

module.exports.serveLoginForm = (req, res) => res.render('users/login')

module.exports.registerUser = async (req, res, next) => {
    try {
        const { email, username, password, isLandlord = false } = req.body.signup;
        const user = new User({ email, username, isLandlord });
        const registeredUser = await User.register(user, password);

        //login user directly after signup
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to PropertEase!');
            res.redirect('/properties');
        });

    } catch (e) {
        req.flash('error', e.message);
        res.redirect('signup');
    }
}

module.exports.loginUser = (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = res.locals.returnTo || '/properties';
    res.redirect(redirectUrl);
}

module.exports.logoutUser = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Logout successfull');
        res.redirect('/properties');
    });
}

module.exports.showUserDashboard = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id).populate('myListings').populate({path : 'upcomingViewings', populate : { path : 'property' }});
    res.render('users/dashboard', { user });
};

module.exports.deleteAccount = async(req, res) => {
    const userID = req.params.id;
    const user = await User
        .findById(userID)
        .populate({ 
            path : 'upcomingViewings', 
            populate : [{ path : 'date' }, { path : 'property'}]
        })

    for (let viewing of user.upcomingViewings) {
        const date = viewing.date;
        const property = await Property.findById(viewing.property._id).populate('availableViewings');

        const newViewing = new Viewing({ date, property : property._id });
        await newViewing.save();
        property.availableViewings.push(newViewing._id);
        await property.save();
    }
    await User.findByIdAndDelete(userID);
    req.flash('success', 'Your account was successfully deleted');
    res.redirect('/properties')
}
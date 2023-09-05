const User = require('../models/user');
const passport = require('passport');

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
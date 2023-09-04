const express = require('express');
const User = require('../models/user');
const router = express.Router();
const catchAsyncError = require('../utils/catchAsyncError');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');

router.get('/signup', (req, res) => res.render('users/signup'));
router.post('/signup', catchAsyncError(async (req, res, next) => {
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
}));

router.get('/login', (req, res) => res.render('users/login'));
router.post('/login', storeReturnTo, passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req, res) => {
        req.flash('success', 'Welcome back!');
        const redirectUrl = res.locals.returnTo || '/properties';
        res.redirect(redirectUrl);
    });

router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Logout successfull');
        res.redirect('/properties');
    });
}); 

module.exports = router;
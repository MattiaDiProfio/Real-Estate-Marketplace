const express = require('express');
const User = require('../models/user');
const router = express.Router();
const catchAsyncError = require('../utils/catchAsyncError');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');
const usersController = require('../controllers/users');

router.route('/signup')
    .get( usersController.serveSignupForm )
    .post( catchAsyncError( usersController.registerUser ));

router.route('/login')
    .get( usersController.serveLoginForm )
    .post(storeReturnTo, passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), usersController.loginUser ); 

router.get('/logout', usersController.logoutUser )

router.get('/:id/dashboard', usersController.showUserDashboard )

module.exports = router;
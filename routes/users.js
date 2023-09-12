const express = require('express');
const User = require('../models/user');
const router = express.Router();
const catchAsyncError = require('../utils/catchAsyncError');
const passport = require('passport');
const { isLoggedIn, storeReturnTo } = require('../middleware');
const usersController = require('../controllers/users');

router.route('/signup')
    .get( usersController.serveSignupForm )
    .post( catchAsyncError( usersController.registerUser ));

router.route('/login')
    .get( usersController.serveLoginForm )
    .post(storeReturnTo, passport.authenticate('local', {failureFlash: true, failureRedirect: '/auth/signup'}), usersController.loginUser ); 

router.get('/logout', usersController.logoutUser )

router.get('/:id/dashboard', isLoggedIn, usersController.showUserDashboard );

router.delete('/:id/delete', usersController.deleteAccount )

module.exports = router;
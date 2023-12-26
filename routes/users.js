const express = require('express');
const User = require('../models/user');
const router = express.Router();
const catchAsyncError = require('../utils/catchAsyncError');
const passport = require('passport');
const { isLoggedIn, storeReturnTo } = require('../middleware');
const usersController = require('../controllers/users');

router.route('/signup')
    // Serve the signup form to a new user
    .get( usersController.serveSignupForm )
    // Register (and login) user using form payload
    .post( catchAsyncError( usersController.registerUser ));
 
router.route('/login')
    // Serve the login form to a returning user
    .get( usersController.serveLoginForm )
    // login user, given that credentials match. Return user to page visited during request of login
    .post(storeReturnTo, passport.authenticate('local', {failureFlash: true, failureRedirect: '/auth/signup'}), usersController.loginUser ); 

// Logout user currently in session
router.get('/logout', usersController.logoutUser )

// Render the dashboard for user currently in session
router.get('/:id/dashboard', isLoggedIn, usersController.showUserDashboard );

// Delete (and logout) user from database and session
router.delete('/:id/delete', usersController.deleteAccount )

module.exports = router;
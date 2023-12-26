const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const { Schema } = mongoose;
const Viewing = require('./viewing');
const Property = require('./property');

// Mongoose schema to represent users
const UserSchema = new Schema({
    email : {
        type : String,
        required : true,
        unique : true
    }, 
    // Field is set by user upon signup
    isLandlord : {
        type : Boolean,
        required : true
    }, 
    // Reference all properties saved by the user 
    likedListings : [{
        type : Schema.Types.ObjectId,
        ref : 'Property'
    }],
    // Reference to all viewings for properties booked by the user
    upcomingViewings : [{
        type : Schema.Types.ObjectId,
        ref : 'Viewing'
    }],
    // Landlord specific - store a reference to all properties advertised by the landlord
    myListings : [{
        type : Schema.Types.ObjectId,
        ref : 'Property'
    }]
});

// Use the 'passport' npm module for authentication of users
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
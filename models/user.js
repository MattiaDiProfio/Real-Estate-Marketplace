const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const { Schema } = mongoose;

const Viewing = require('./viewing');
const Property = require('./property');

const UserSchema = new Schema({
    email : {
        type : String,
        required : true,
        unique : true
    }, 
    isLandlord : {
        type : Boolean,
        required : true
    }, 
    likedListings : [{
        type : Schema.Types.ObjectId,
        ref : 'Property'
    }],
    upcomingViewings : [{
        type : Schema.Types.ObjectId,
        ref : 'Viewing'
    }]
});

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', UserSchema);
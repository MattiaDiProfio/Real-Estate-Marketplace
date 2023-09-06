/**
 * Mongoose model to represent a Property Entity in the Mongo DB
 */

const mongoose = require('mongoose');
const Viewing = require('./viewing');
const User = require('./user');
const { Schema } = mongoose;

const PropertySchema = new Schema({
    street : String,
    city : String,
    description : String,
    image : String,
    monthlyRent : Number,
    numberRooms : Number,
    availableViewings : [String], 
    viewings : [{
        type : Schema.Types.ObjectId,
        ref : 'Viewing'
    }],
    landlord : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    }
});

PropertySchema.virtual('address').get(function() {
    return `${this.street}, ${this.city}`;
});

PropertySchema.virtual('rooms').get(function() {
    return `${this.numberRooms} ${this.numberRooms == 1 ? 'Room' : 'Rooms'}`;
})

// mongoose middleware to delete all viewings associated with a property when the listing is removed
PropertySchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Viewing.deleteMany({
            _id : { $in : doc.viewings }
        })
        await User.deleteMany({
            _id : { $in : doc.likedListings }
        })
    }
})


module.exports = new mongoose.model('Property', PropertySchema);
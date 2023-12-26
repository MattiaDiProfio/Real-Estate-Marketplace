const mongoose = require('mongoose');
const Viewing = require('./viewing');
const User = require('./user');
const { Schema } = mongoose;

// Mongoose model to represent the Image associated with each listing
const ImageSchema = new Schema({
    url : String,
    filename : String
});

// Define a virtual property for Image schema - requires less storage space when uploaded to Cloudinary
ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_300,h_200');
});

// Mongoose model to represent a Property Entity in the Mongo DB
const PropertySchema = new Schema({
    street : String,
    city : String,

    // Coordinates required for listing map
    geometry : {
        type : {
            type : String,
            enum : ['Point'],
            required : true  
        }, 
        coordinates : {
            type : [Number], 
            required : true
        }
    },
    description : String,
    images : [ImageSchema],
    monthlyRent : Number,
    numberRooms : Number,
    availableViewings : [String], 
    // Store a reference to all viewings booked for the property
    viewings : [{
        type : Schema.Types.ObjectId,
        ref : 'Viewing'
    }],
    // Store a reference to the landlord User instance
    landlord : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    }
});

// Virtual property to quickly compute a formatted address string for the property
PropertySchema.virtual('address').get(function() {
    return `${this.street}, ${this.city}`;
});

// Virtual property to compute a string version of the number of rooms for the property
PropertySchema.virtual('rooms').get(function() {
    return `${this.numberRooms} ${this.numberRooms == 1 ? 'Room' : 'Rooms'}`;
});

// Mongoose middleware to delete all viewings associated with a property when the listing is removed
PropertySchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        // Delete all instance of Viewing in which the property id appears
        await Viewing.deleteMany({
            _id : { $in : doc.viewings }
        })
        // Remove delete property from all users' liked-listings 
        await User.deleteMany({
            _id : { $in : doc.likedListings }
        })
    }
});

module.exports = new mongoose.model('Property', PropertySchema);
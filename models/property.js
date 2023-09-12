/**
 * Mongoose model to represent a Property Entity in the Mongo DB
 */

const mongoose = require('mongoose');
const Viewing = require('./viewing');
const User = require('./user');
const { Schema } = mongoose;

const ImageSchema = new Schema({
    url : String,
    filename : String
})

ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_300,h_200');
})

const PropertySchema = new Schema({
    street : String,
    city : String,
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
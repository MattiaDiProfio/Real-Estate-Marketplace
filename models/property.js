/**
 * Mongoose model to represent a Property Entity in the Mongo DB
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const PropertySchema = new Schema({
    street : String,
    city : String,
    description : String,
    image : String,
    monthlyRent : Number,
    numberRooms : Number
});

PropertySchema.virtual('address').get(function() {
    return `${this.street}, ${this.city}`;
})

module.exports = new mongoose.model('Property', PropertySchema);
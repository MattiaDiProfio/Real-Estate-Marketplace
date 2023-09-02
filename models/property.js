/**
 * Mongoose model to represent a Property Entity in the Mongo DB
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const PropertySchema = new Schema({
    address : String,
    description : String,
    image : String,
    monthlyRent : Number,
    numberRooms : Number
});

module.exports = new mongoose.model('Property', PropertySchema);
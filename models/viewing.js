const mongoose = require('mongoose');
const { Schema } = mongoose;

// Mongoose model to represent a property viewing instance
const ViewingSchema = new Schema({ 
    date : String,
    // Reference the property on which user placed booking
    property : {
        type : Schema.Types.ObjectId,
        ref : 'Property'
    }, 
    // Reference the user which placed the booking 
    requestedBy : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    }
});

module.exports = new mongoose.model('Viewing', ViewingSchema);
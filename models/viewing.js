const mongoose = require('mongoose');
const { Schema } = mongoose;

const ViewingSchema = new Schema({ 
    date : String,
    property : {
        type : Schema.Types.ObjectId,
        ref : 'Property'
    }, 
    requestedBy : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    }
});

module.exports = new mongoose.model('Viewing', ViewingSchema);
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ViewingSchema = new Schema({ date : String });


module.exports = new mongoose.model('Viewing', ViewingSchema);
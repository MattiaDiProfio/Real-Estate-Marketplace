const joi = require('joi');

//define joi validation schema
module.exports.propertySchema = joi.object({
    property : joi.object({
        city : joi.string().required(),
        street : joi.string().required(),
        numberRooms : joi.number().min(1).max(6).required(),
        monthlyRent : joi.number().min(100).max(300).required(),
        description : joi.string().required()
    }).required(),
    deleteImages : joi.array()
});

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

/**
    Set-up connection to cloudinary
    Allows for storage and management of property photos
 */
cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_KEY,
    api_secret : process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary, 
    params : {
        folder : 'PropertEase'
    }
});

module.exports = { cloudinary, storage };
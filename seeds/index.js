const mongoose = require('mongoose');
const Property = require('../models/property')
const streets = require('./streets');
const cities  = require('./cities');
const { generateAvailableViewings } = require('../utils/generateDates');
const { rentPerRoom } = require('../utils/generateRent');

mongoose.connect('mongodb://localhost:27017/PropertEase', { useNewUrlParser : true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error!'));
db.once('open', () => console.log('database connected!'));


const seedDatabase = async() => {
    // delete all entries in the local database
    await Property.deleteMany({});

    //populate database with randomly generated properties
    for(let i = 0; i < 20; i++) {

        // randomly generate property data
        let houseNumber = Math.floor(Math.random() * 99) + 1;
        let streetName = streets[i];
        let city = cities[Math.floor(Math.random() * cities.length)];
        let street = `${houseNumber} ${streetName}`;
        let numRooms = Math.floor(Math.random() * 6) + 1;
        let monthlyRent = numRooms * rentPerRoom();

        const newProperty = new Property({
            city : city.city,
            street,
            description : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nec diam ac nunc tincidunt fermentum. Integer bibendum velit at felis posuere, a laoreet velit lacinia. Sed fringilla sapien sed dolor luctus, sed venenatis tortor efficitur. Pellentesque euismod elit nec eros aliquet, eget gravida neque tristique. Nulla facilisi. Vivamus in dui non purus bibendum facilisis. Sed auctor tortor non quam iaculis, vel mattis quam aliquam. Vivamus eget massa eu odio cursus aliquam. Donec auctor, velit vel scelerisque malesuada, tortor libero sollicitudin velit, nec ultricies libero odio id metus. Sed lacinia, felis in eleifend cursus, odio justo hendrerit risus, id bibendum enim quam a justo',
            monthlyRent,
            images : [{
                url: 'https://res.cloudinary.com/db4uniq61/image/upload/v1694521642/PropertEase/oduytdyam5ydsz7kgrqs.jpg',
                filename: 'PropertEase/oduytdyam5ydsz7kgrqs'
            }],
            numberRooms : numRooms, 
            availableViewings : generateAvailableViewings(),
            geometry : {
                type : 'Point', 
                coordinates : [city.longitude, city.latitude]
            },
            // for now user { mattia : mattia } is the landlord of all seeded listings
            landlord : "64f97c9cf917a0630f20fca1"
        });
        
        await newProperty.save();
    }
}

seedDatabase().then(() => mongoose.connection.close());
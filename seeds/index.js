require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('../models/property')
const streets = require('./streets');
const cities  = require('./cities');
const { generateAvailableViewings } = require('../utils/generateDates');
const { rentPerRoom } = require('../utils/generateRent');
const dburl = process.env.DB_URL

// Set up database connection
mongoose.connect(dburl, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error!'));
db.once('open', () => console.log('database connected!'));

// Populate database using 
const seedDatabase = async() => {
    // Delete all entries in the local database
    await Property.deleteMany({});

    // Populate database with randomly generated properties
    for(let i = 0; i < 20; i++) {

        // Randomly generate property data
        let houseNumber = Math.floor(Math.random() * 99) + 1;
        let streetName = streets[i];
        let city = cities[Math.floor(Math.random() * cities.length)];
        let street = `${houseNumber} ${streetName}`;
        let numRooms = Math.floor(Math.random() * 6) + 1;
        let monthlyRent = numRooms * rentPerRoom();

        // Create new property instance and set its attributes
        const newProperty = new Property({
            city : city.city,
            street,
            description : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nec diam ac nunc tincidunt fermentum. Integer bibendum velit at felis posuere, a laoreet velit lacinia. Sed fringilla sapien sed dolor luctus, sed venenatis tortor efficitur. Pellentesque euismod elit nec eros aliquet, eget gravida neque tristique. Nulla facilisi. Vivamus in dui non purus bibendum facilisis. Sed auctor tortor non quam iaculis, vel mattis quam aliquam. Vivamus eget massa eu odio cursus aliquam. Donec auctor, velit vel scelerisque malesuada, tortor libero sollicitudin velit, nec ultricies libero odio id metus. Sed lacinia, felis in eleifend cursus, odio justo hendrerit risus, id bibendum enim quam a justo',
            monthlyRent,
            images : [{
                // URL same for all listings
                url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
                filename: 'PropertEase/oduytdyam5ydsz7kgrqs'
            }],
            numberRooms : numRooms, 
            availableViewings : generateAvailableViewings(),
            // Set geographical location
            geometry : {
                type : 'Point', 
                coordinates : [city.longitude, city.latitude]
            },
            // Default user
            landlord : "658caf2c3ff82fccd15cdf40"
        });
        
        await newProperty.save();
    }
}

// Close database connection once popolated successfully
seedDatabase().then(() => mongoose.connection.close());
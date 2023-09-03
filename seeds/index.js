const mongoose = require('mongoose');
const Property = require('../models/property')
const streets = require('./streets');
const cities  = require('./cities');

mongoose.connect('mongodb://localhost:27017/PropertEase', { useNewUrlParser : true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error!'));
db.once('open', () => console.log('database connected!'));

const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * function rentPerRoom
 * generate rent per room per month between £100 and £300
 * with £25 increment between each value from the selection
 */
const rentPerRoom = (min=100, max=300, increment=25) => {
    const numPossibleValues = Math.floor((max - min) / increment) + 1;
    const randomIndex = getRandomNumber(0, numPossibleValues - 1);
    const randomNumber = min + randomIndex * increment;
    return randomNumber;
}

const seedDatabase = async() => {
    // delete all entries in the local database
    await Property.deleteMany({});

    //populate database with randomly generated properties
    for(let i = 0; i < 100; i++) {

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
            image : 'https://source.unsplash.com/collection/30715847',
            numberRooms : numRooms
        });
        
        await newProperty.save();
    }
}

seedDatabase().then(() => mongoose.connection.close());
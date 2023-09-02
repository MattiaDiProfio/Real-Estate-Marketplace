const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const engine = require('ejs-mate');

const Property = require('./models/property');

//set up connection to mongoDB
mongoose.connect('mongodb://localhost:27017/PropertEase', { useNewUrlParser : true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error!'));
db.once('open', () => console.log('database connected!'));

const app = express();

app.set('view engine', 'ejs');
app.engine('ejs', engine)
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended : true }));
app.use(methodOverride('_method'));


app.get('/', async (request, response) => {
    response.render('home')
});

// render a view of all properties
app.get('/properties', async (req, res) => {
    const allProperties = await Property.find({});
    res.render('properties/index', { allProperties });
});

//serve the form to create new property
app.get('/properties/new', (req, res) => {
    res.render('properties/new');
})

//serve form to allow user to perform a personal search of listings
app.get('/properties/search', (req, res) => res.render('properties/search'));

// serve forms to allow for user login and signup
app.get('/login', (req, res) => res.render('users/login'));
app.get('/signup', (req, res) => res.render('users/signup'))

// render a more detailed view of a single property
app.get('/properties/:id', async(req, res) => {
    const { id } = req.params;
    const property = await Property.findById(id);
    res.render('properties/show', { property });
})

// serve form to edit a specific rout
app.get('/properties/:id/edit', async (req, res) => {
    const { id } = req.params;
    const property = await Property.findById(id);
    res.render('properties/edit', { property });
});


// post new property info to the db
app.post('/properties', async (req, res) => {
    const newProperty = new Property(req.body.property);
    await newProperty.save();
    res.redirect(`/properties/${newProperty._id}`);
});

// edit property using data from the edit form
app.put('/properties/:id/edit', async(req, res) => {
    const { id } = req.params;
    const property = await Property.findByIdAndUpdate(id, { ...req.body.property }, { new : true });
    await property.save();
    res.redirect(`/properties/${property._id}`)
});

// delete property from db
app.delete('/properties/:id', async(req, res) => {
    const { id } = req.params;
    await Property.findByIdAndDelete(id);
    res.redirect('/properties');
})

app.listen(3000, () => console.log('server live on port 3000'));
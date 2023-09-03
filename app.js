const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const engine = require('ejs-mate');
const Property = require('./models/property');

//validation
const catchAsyncError = require('./utils/catchAsyncError');
const ExpressError = require('./utils/ExpressError');
const { propertySchema } = require('./schemas');

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

// joi validation middleware
const validateProperty = (req, res, next) => {
    //validate form data
    const { error } = propertySchema.validate(req.body);
    const errorMessage = error.details.map(err => err.message.join(', '));
    if (validEntry.error) throw new ExpressError(errorMessage, 400);
    else next(); //proceed to the next middleware
}

app.get('/', catchAsyncError(async (request, response) => {
    response.render('home')
}));

// render a view of all properties
app.get('/properties', catchAsyncError(async (req, res) => {
    const allProperties = await Property.find({});
    res.render('properties/index', { allProperties, calledFromNavbar : true });
}));

//serve the form to create new property
app.get('/properties/new', (req, res) => {
    res.render('properties/new');
})

//serve form to allow user to perform a personal search of listings
app.get('/properties/search', (req, res) => res.render('properties/search'));

app.post('/properties/search', catchAsyncError(async (req, res) => {
    let { city, minRooms, maxRooms, order } = req.body.filterParams;
    city = city ? city : { $gt : '' } // select all cities if an address is not given
    minRooms = Math.min(minRooms, maxRooms);
    maxRooms = Math.max(minRooms, maxRooms);
    let sortingCondition;
    switch (order) {
        case 'rentLowHigh' :
            sortingCondition = { monthlyRent : 1 };
            break;
        case 'rentHighLow' :
            sortingCondition = { monthlyRent : -1 };
            break;
        case 'roomsLowHigh' :
            sortingCondition = { numberRooms : 1 };
            break;
        case 'roomsHighLow' :
            sortingCondition = { numberRooms : - 1};
            break;
    }
    let allProperties = await Property.find({
        city : city,
        numberRooms : { $gte : Number(minRooms), $lte : Number(maxRooms) }
    }).sort(sortingCondition);

    res.render('properties/index', { allProperties, calledFromNavbar : false });
}));

// serve forms to allow for user login and signup
app.get('/login', (req, res) => res.render('users/login'));
app.get('/signup', (req, res) => res.render('users/signup'))

// render a more detailed view of a single property
app.get('/properties/:id', catchAsyncError(async(req, res) => {
    const { id } = req.params;
    const property = await Property.findById(id);
    res.render('properties/show', { property });
}));

// serve form to edit a specific rout
app.get('/properties/:id/edit', catchAsyncError(async (req, res) => {
    const { id } = req.params;
    const property = await Property.findById(id);
    res.render('properties/edit', { property });
}));

// post new property info to the db
app.post('/properties', validateProperty, catchAsyncError(async (req, res) => {
    const newProperty = new Property(req.body.property);
    await newProperty.save();
    res.redirect(`/properties/${newProperty._id}`);
}));

// edit property using data from the edit form
app.put('/properties/:id/edit', catchAsyncError(async(req, res) => {
    const { id } = req.params;
    const property = await Property.findByIdAndUpdate(id, { ...req.body.property }, { new : true });
    await property.save();
    res.redirect(`/properties/${property._id}`)
}));

// delete property from db
app.delete('/properties/:id', catchAsyncError(async(req, res) => {
    const { id } = req.params;
    await Property.findByIdAndDelete(id);
    res.redirect('/properties');
}));

app.all('*', (req, res, next) => {
    next(new ExpressError('404 Page Not Found!', 404));
})

app.use((err, req, res, next) => {
    const { statusCode } = err;
    if (!statusCode) statusCode = 500;
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => console.log('server live on port 3000'));
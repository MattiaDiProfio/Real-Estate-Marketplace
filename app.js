const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const engine = require('ejs-mate');

//validation
const catchAsyncError = require('./utils/catchAsyncError');
const ExpressError = require('./utils/ExpressError');

//property routes
const properties = require('./routes/properties');

//viewing routes
const viewings = require('./routes/viewings');

//set up connection to mongoDB
mongoose.connect('mongodb://localhost:27017/PropertEase', { useNewUrlParser : true, useUnifiedTopology : true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error!'));
db.once('open', () => console.log('database connected!'));

const app = express();

app.set('view engine', 'ejs');
app.engine('ejs', engine)
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended : true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/properties', properties);
app.use('/properties/:id/viewings', viewings);

app.get('/', catchAsyncError(async (request, response) => {
    response.render('home')
}));


// serve forms to allow for user login and signup
app.get('/login', (req, res) => res.render('users/login'));
app.get('/signup', (req, res) => res.render('users/signup'))


app.all('*', (req, res, next) => {
    next(new ExpressError('404 Page Not Found!', 404));
})

app.use((err, req, res, next) => {
    let { statusCode } = err;
    if (!statusCode) statusCode = 500;
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => console.log('server live on port 3000'));
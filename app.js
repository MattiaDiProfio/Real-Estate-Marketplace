// Configure environment for either production or deployment
if (process.env.NODE_ENV !== "production") require('dotenv').config();

// Import all required application packages & files
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const engine = require('ejs-mate');
const catchAsyncError = require('./utils/catchAsyncError');
const ExpressError = require('./utils/ExpressError');
const propertiesRoutes = require('./routes/properties');
const viewingsRoutes = require('./routes/viewings');
const usersRoutes = require('./routes/users');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local'); // Hashing strategy used during authentication
const User = require('./models/user');
const localDBurl = 'mongodb://localhost:27017/PropertEase';
const secret = process.env.SECRET || 'dev-backup-secret';
const mongoSession = require('express-session');
const MongoStore = require('connect-mongo');

// Set up connection to mongoDB
mongoose.connect(localDBurl, { useNewUrlParser : true, useUnifiedTopology : true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error!'));
db.once('open', () => console.log('database connected!'));

// Instantiate the express application
const app = express();

// Configure Express application
app.set('view engine', 'ejs');
app.engine('ejs', engine)
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended : true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Set up MongoStore session
const store = MongoStore.create({
    mongoUrl: localDBurl,
    touchAfter: 24 * 60 * 60,
    crypto: { secret }
});

store.on("error", function(e) {
    console.log('error on session store setup', e);
})

// Configure browser session settings
app.use(session({ 
        secret,
        name : 'propertease-session',
        store : store,
        resave : false, 
        saveUninitialized : true, 
        cookie : {
            // Cookies will expire after 1 week
            expires : Date.now() + (3600 * 1000 * 24 * 7),
            maxAge : (3600 * 1000 * 24 * 7),
            httpOnly : true
        }
    }));

// Set up flash npm module
app.use(flash());

// Set up passport package for user authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Set up flash middleware
app.use((req, res, next) => {
    // We have automatic access to these variables in every template by default
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
})

// Set up app route controllers  
app.use('/properties', propertiesRoutes);
app.use('/properties/:id/viewings', viewingsRoutes);
app.use('/auth', usersRoutes);

// Home route
app.get('/', catchAsyncError(async (request, response) => {
    response.render('home')
}));

// Defaul route handler
app.all('*', (req, res, next) => {
    next(new ExpressError('404 Page Not Found!', 404));
})

app.use((err, req, res, next) => {
    let { statusCode } = err;
    if (!statusCode) statusCode = 500;
    console.log(statusCode);
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => console.log('server live on port 3000'));
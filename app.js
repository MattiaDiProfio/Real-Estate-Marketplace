const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

//set up connection to mongoDB
mongoose.connect('mongodb://localhost:27017/PropertEase', { useNewUrlParser : true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error!'));
db.once('open', () => console.log('database connected!'));

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', async (request, response) => {
    response.render('home')
})

app.listen(3000, () => console.log('server live on port 3000'));
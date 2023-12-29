# PropertEase

PropertEase is a fictional real-estate web application where users looking for a property can explore and save liked properties, to then book viewing appointments and homeowners can advertise their property using the intuitive upload procedure. All users can then access and manager their properties, viewings and listings through a minimalistic dashboard.

### Setup

Please follow these steps to setup a **local copy**

1. To setup the application on you local machine, clone this repo and run the command `npm install` to acquire all the dependencies needed.

2. Create a Cloudinary account and store the cloudname, key and secret as environment variables in a `.env` file.

3. Setup a local instance of a MongoDB database and connect it to your app using the `localDBurl` variable, found in `app.js`.

4. Run `node app.js` from your git bash terminal, and everything should be working properly. Your local copy should be live on `localhost`

Alternitavely, you can explore the app following this [demo link](https://propertease-engq.onrender.com/properties). You can create an account of your own and explore the app as a homeseeker or homeowner.

### Tech

- The **User layer** for this project has been implemented using HTML5/CSS3 as well as BootstrapCSS and EJS for dynamic templating, however an implementation using ReactJS will be adopted in the future.

- The **Business layer** has been developed using NodeJS, ExpressJS* and Mongoose.

- The underlying **Database layer** for this application is MongoDB and the deployment has been carried out using Render.

I have attached a table describing the name and purpose of each module used within the app.

Module name | Purpose
---|---
`cloudinary` | connect app to clodinary web service to store property images
`connect-flash` | flash feedback messages to users
`connect-mongo` | setup connection to MongoDB database
`dotenv` | allows for creation of .env file to store environment variables
`ejs/ejs-mate` | allows for dynamic templating using ejs in an express app
`express` | framework used to develop NodeJS apps
`express-session` | allows for use of session and cookies
`joi` | mongoose schema validation
`mongoose` | allows for MongDB ODM and management of MongoDB collections
`mapbox sdk` | allows for use of the mapbox api and its mapping features
`method-override` | overrides default html form behaviour to send all request types via form submission
`passport` | user authentication and authorization

### Author note

Feedback on the app is much apprieciated, so if you encounter any issues or bugs while navigating the website or have an idea for any sort of improvement, feel free to get in touch :) - Mattia.

const express          = require('express');
const path             = require('path');
const cookieParser     = require('cookie-parser');
const bodyParser       = require('body-parser');
const expressValidator = require('express-validator');
const flash            = require('connect-flash');
const session          = require('express-session');
const mongoose         = require('mongoose');
const MongoStore       = require('connect-mongo')(session);
const logger           = require('morgan');
const errorHandlers    = require('./handlers/errorHandlers');
const indexRoute       = require('./routes/index');
const PORT             = process.env.PORT || 8000;

/**
 * .env file
 */
require('dotenv').config({ path: 'variables.env' });

/**
 * connecting to the database
 */
mongoose.connect(process.env.DATABASE);
mongoose.connection.once('open', () => {
	console.log('You are now connected to the Database');
}).on('error', (e) => {
	console.log(`error: ${e.message}`);
});

// create our express app
const app = express();

/**
 * Middlewares
 */
// setting up our view and public files
app.set('view engine', 'pug');
app.use('views', express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'public')));

// logger middleware
app.use(logger('dev'));
// Body-parser Middelware, Takes the raw requests and turns them into usable properties on req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Exposes a bunch of methods for validating data. Used heavily on userController.validateRegister
app.use(expressValidator());

// populates req.cookies with any cookies that came along with the request
app.use(cookieParser());

// Sessions allow us to store data on visitors from request to request
// This keeps users logged in and allows us to send flash messages
// app.use(session({
// 	secret: process.env.SECRET,
// 	key: process.env.KEY,
// 	resave: false,
// 	saveUninitialized: false,
// 	store: new MongoStore({
// 		mongooseConnection: mongoose.connection
// 	})
// }));

// flash middleware for flashes messages
// app.use(flash());

// pass variables to our templates + all requests
// app.use((req, res, next) => {
// 	res.locals.h = helpers;
// 	res.locals.flashes = req.flash() || null;
// 	next();
// });

app.use('/', indexRoute);

// If that above routes didnt work, we 404 them and forward to error handler
// app.use(errorHandlers.notFound);

// One of our error handlers will see if these errors are just validation errors
// app.use(errorHandlers.flashValidationErrors);

// Otherwise this was a really bad error we didn't expect! Shoot eh
// if (app.get('env') === 'development') {
// 	/* Development Error Handler - Prints stack trace */
// 	app.use(errorHandlers.developmentErrors);
// }

// production error handler
// app.use(errorHandlers.productionErrors);

/**
 * Listen to the server
 */
app.listen(PORT, () => {
	console.log(`You are now listen to the server on localhost:${PORT}`);
});
const express          = require('express');
const path             = require('path');
const bodyParser       = require('body-parser');
const session          = require('express-session');
const cookieParser 	   = require('cookie-parser');
const flash			   = require('connect-flash');
const mongoose         = require('mongoose');
const MongoStore       = require('connect-mongo')(session);
const logger           = require('morgan');
const helpers		   = require('./helpers');
const errorHandlers    = require('./handlers/errorHandlers');
const indexRoute       = require('./routes/index');
const apiRoute 		   = require('./routes/api');
const companiesRouter  = require('./routes/companies');
const PORT             = process.env.PORT || 8000;
mongoose.Promise	   = global.Promise;

/**
 * .env file
 * DATABASE=mongodb://hajj-umrah-management-system:12345678910@ds111608.mlab.com:11608/hajj-umrah-management-system
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
app.use('views', express.static(path.join(__dirname, '/views')));
app.use(express.static(path.join(__dirname, 'public')));

// logger middleware
app.use(logger('dev'));

// populates req.cookies with any cookies that came along with the request
app.use(cookieParser());

// Sessions allow us to store data on visitors from request to request
// This keeps users logged in and allows us to send flash messages
app.use(session({
	secret: process.env.SECRET,
	key: process.env.KEY,
	resave: false,
	saveUninitialized: false,
	store: new MongoStore({
		mongooseConnection: mongoose.connection
	})
}));
// flash middleware will send a message for success of failur operation to the next page we direct to
app.use(flash());

// Body-parser Middelware, Takes the raw requests and turns them into usable properties on req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.use((req, res, next)=> {
	res.locals.h = helpers;
	res.locals.flashes = req.flash();
	next();
});


app.use('/', indexRoute);
app.use('/api/v1', apiRoute);
app.use('/companies', companiesRouter);


// If that above routes didnt work, we 404 them and forward to error handler
app.use(errorHandlers.notFound);

// One of our error handlers will see if these errors are just validation errors
app.use(errorHandlers.flashValidationErrors);

// Otherwise this was a really bad error we didn't expect! Shoot eh
if (app.get('env')==='development') {
	/* Development Error Handler - Prints stack trace */
	app.use(errorHandlers.developmentErrors);
}

// production error handler
app.use(errorHandlers.productionErrors);


/**
 * Listen to the server
 */
app.listen(PORT, () => {
	console.log(`You are now listen to the server on localhost:${PORT}`);
});
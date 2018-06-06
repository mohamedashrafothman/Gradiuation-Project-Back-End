const express          = require('express');
const session          = require('express-session');
const mongoose         = require('mongoose');
const MongoStore       = require('connect-mongo')(session);
const path             = require('path');
const cookieParser 	   = require('cookie-parser');
const bodyParser       = require('body-parser');
const logger           = require('morgan');
const passport 		   = require('passport');
const csrf			   = require('csurf');
const promisify        = require('es6-promisify');
const flash			   = require('connect-flash');
const expressValidator = require('express-validator');
const helpers		   = require('./helpers');
const indexRoute       = require('./routes/index');
const dashboardRoute   = require('./routes/dashboard');
const apiRoute 		   = require('./routes/api');

// const usersRoute	   = require('./routes/users');
const errorHandlers    = require('./handlers/errorHandlers');
const PORT             = process.env.PORT || 8000;
mongoose.Promise	   = global.Promise;

/**
 * .env file
 * DATABASE=mongodb://localhost/GP
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

// Body-parser Middelware, Takes the raw requests and turns them into usable properties on req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(expressValidator({
	errorFormatter: function(param, msg, value){
		var namespace = param.split('.'),
		root = namespace.shift(),
		formParam = root;
		
		while(namespace.length){
			formParam += '[' + namespace.shift() + ']';
		}
		return {
			param: formParam,
			msg: msg,
			value: value
		};
	}
}));


// populates req.cookies with any cookies that came along with the request
app.use(cookieParser(process.env.SECRET));
// csrf middleware function goes right after cookie parser
app.use(csrf({ cookie: true }));
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

// Passport JS is what we use to handle our logins
app.use(passport.initialize());
app.use(passport.session());

// flash middleware will send a message for success of failur operation to the next page we direct to
app.use(flash());


app.use((req, res, next)=> {
	res.locals.h = helpers;
	res.locals.flashes = req.flash();
	res.locals.csrfToken = req.csrfToken;	
	res.locals.user = req.user || null;
	next();
});

// promisify some callback based APIs
app.use((req, res, next) => {
	req.login = promisify(req.login, req);
	next();
});

// initial routes
app.use('/', indexRoute);
app.use('/dashboard', dashboardRoute);
app.use('/api/v1', apiRoute);


app.use(errorHandlers.invalidCsrfToken);

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
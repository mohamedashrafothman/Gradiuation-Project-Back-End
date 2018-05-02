/*====================================================================================================
	This is a file of data and helper functions that we can expose and use in our templating function
====================================================================================================*/

// moment.js is a handy library for displaying dates. We need this in our templates to display things like "Posted 5 minutes ago"
const moment = require('moment');

// Dump is a handy debugging function we can use to sort of "console.log" our data
const dump = (obj) => JSON.stringify(obj, null, 2);

const isEmpty = (obj)=> {
	for (var key in obj) {
		if (obj.hasOwnProperty(key))
			return false;
	}
	return true;
};

// Making a static map is really long - this is a handy helper function to make one
const staticMap = ([lng, lat]) => `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=14&size=800x150&key=${process.env.MAP_KEY}&markers=${lat},${lng}&scale=2`;

const siteName = 'Hajj and Umrah Management System';

const dateInDays = (start, end)=> {
	const from = moment(start, 'D-M-YYYY');
	const to = moment(end, 'D-M-YYYY');
	const days = to.diff(from, 'days');
	return days;
};

module.exports = {
	moment,
	dump,
	staticMap,
	siteName,
	isEmpty,
	dateInDays
};

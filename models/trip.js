const mongoose         = require('mongoose');
const User             = require('./user');
const Schema           = mongoose.Schema;
      mongoose.Promise = global.Promise;


const tripSchema = new Schema({
	author: {
		type    : mongoose.Schema.ObjectId,
		ref     : 'User',
		required: 'You must apply an author'
	},
	type    : String,
	duration: {
		from: String,
		to  : String
	},
	durationInDays: String,
	created: {
		type   : Date,
		default: Date.now
	},
	code   : String,
	hotel: {
		name: String,
		include : String,
		location: {
			type: {
				type: String,
				default: 'point'
			},
			coordinates: [{
				type: Number,
				required: 'You must supply coordinates'
			}],
			address: {
				type: String,
				required: 'You must supply an address!'
			}
		},
		international_phone_number: String,
		rating: Number
	},
	updated: Date
});

module.exports = mongoose.model('Trip', tripSchema);
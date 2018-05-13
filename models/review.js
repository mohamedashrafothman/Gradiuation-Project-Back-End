const User             = require('./user');
const trip             = require('./trip');
const mongoose         = require('mongoose');
const Schema           = mongoose.Schema;
      mongoose.Promise = global.Promise;

const reviewSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
	company: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: 'You must supply a company!'
	},
	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: 'You must supply a user!'
	},
	text: {
		type: String,
		required: 'You must supply a review content!'
	},
	rating: {
		type: Number,
		min: 1,
		max: 5
	},
	removed: {
		type: Boolean,
		default: false
	}
});
module.exports = mongoose.model('Review', reviewSchema);
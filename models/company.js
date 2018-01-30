/**
 * Requiring Dependencies
 */
const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
const slug     = require('slugs');
const validator = require('validator');

// Company Schema
const companySchema = new Schema({
	name: {
		type: String,
		required: 'please enter a company name',
		trim: true
	},
	slug: String,
	description: {
		type: String,
		trim: true
	},
	photo: String,
	contacts: {
		mobileNumber: String,
		email: {
			type: String,
			unique: true,
			lowercase: true,
			trim: true,
			validate: [validator.isEmail, 'Invalid Email Address']
		}
	},
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
		},
		country: {
			type: String,
			required: 'You must supply an address!'
		},
		city: {
			type: String,
			required: 'You must supply an address!'
		}
	},
	created: {
		type: Date,
		default: Date.now
	}

});


// before saving make slug property
companySchema.pre('save', function(next) {
	if(!this.isModified('name')){
		next(); // skip it
		return ; // stop this function from running
	}
	this.slug = slug(this.name); // assign slug name to slug property
	next(); // go to next function
});



module.exports = mongoose.model('Company', companySchema);
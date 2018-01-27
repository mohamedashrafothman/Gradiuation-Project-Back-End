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
		address: String,
		country: String,
		city: String
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
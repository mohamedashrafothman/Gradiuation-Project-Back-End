const mongoose         = require('mongoose');
const User             = require('./user');
const Request          = require('./request');
const slug             = require('speakingurl');
const Schema           = mongoose.Schema;
      mongoose.Promise = global.Promise;


const tripSchema = new Schema({
	name: String,
	slug: String,
	author: {
		type    : mongoose.Schema.ObjectId,
		ref     : 'User',
		required: 'You must apply an author'
	},
	description: String,
	type    : {
		type:String,
		required: 'yo must apply an trip type'
	},
	travel_type: {
		type: String,
		required: 'You must apply an travel type'
	},
	price: {
		type:Number,
		required: "you must apply an price"
	},
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
	removed: {
		type: Boolean,
		default: false
	},
	requests: [{
		type: mongoose.Schema.ObjectId,
		ref: 'Request'
	}],
	updated: Date
});

tripSchema.pre('save', async function (next) {
	if (!this.isModified('name')) {
		next(); // skip it
		return; // stop this function from running
	}
	this.slug = slug(this.name, {lang: 'ar', mark:true}); // assign slug name to slug property
	const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
	const tripWithSlug = await this.constructor.find({ slug: slugRegEx });
	if (tripWithSlug.length) {
		this.slug = `${this.slug}-${tripWithSlug.length + 1}`;
	}
	next(); // go to next function
});

module.exports = mongoose.model('Trip', tripSchema);
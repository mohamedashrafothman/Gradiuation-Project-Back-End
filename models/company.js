/**
 * Requiring Dependencies
 */
const mongoose              = require('mongoose');
const Schema                = mongoose.Schema;
mongoose.Promise      		= global.Promise;
const slug                  = require('slugs');
const validator             = require('validator');
const md5                   = require('md5');
const Trip					= require('./trip');
const mongoodbErrorHandler  = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');
const bcrypt = require('bcryptjs');

// Company Schema
const companySchema = new Schema({
	name: {
		type: String,
		required: 'please enter a company name',
		trim: true
	},
	username: String,
	slug: String,
	description: {
		type: String,
		trim: true
	},
	photo: {
		type: String,
		index: true
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
	},
	password: {
		type: String
	},
	trips: [{
		type: mongoose.Schema.ObjectId,
		ref: 'Trip'
	}],
	resetPasswordTaken: String,
	resetPasswordExpires: Date

});

// before saving make slug property
companySchema.pre('save', async function(next) {
	if(!this.isModified('name')){
		next(); // skip it
		return ; // stop this function from running
	}
	this.slug = slug(this.name); // assign slug name to slug property

	// create a unique company name
	const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
	const companyWithSlug = await this.constructor.find({slug: slugRegEx});
	if(companyWithSlug.length){
		this.slug = `${this.slug}-${companyWithSlug.length + 1}`;
	}

	next(); // go to next function
});



var Company = module.exports = mongoose.model('Company', companySchema);

module.exports.createCompany = (newCompany, callback)=> {
	bcrypt.genSalt(10, function(err, salt){
		bcrypt.hash(newCompany.password, salt, function(err, hash){
			newCompany.password = hash;
			newCompany.save(callback);
			console.log(newCompany);
		})
	});
};
module.exports.getCompaniesByUsername = (username, callback)=> {
	Company.findOne({username: username}, callback);
};
module.exports.getCompanyById = (id, callback) => {
	Company.findById(id, callback);
};
module.exports.comparePassword = (candidatePassword, hash, callback)=>{
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
		if(err) throw err;
		callback(null, isMatch);
	});
};
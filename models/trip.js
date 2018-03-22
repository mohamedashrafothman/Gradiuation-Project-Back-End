const mongoose = require('mongoose');
const Company = require('./company');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;


const tripSchema = new Schema({
	author: {
		type: mongoose.Schema.ObjectId,
		ref: 'Company',
		required: 'You must apply an author'
	},
	type: String,
	include: [String],
	duration: {
		from: String,
		to: String
	},
	created: {
		type: Date,
		default: Date.now
	},
	code: String,
	updated: Date
});


tripSchema.pre('save', async function(next){
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	};
	this.code = await s4() + s4();
	// create a unique code for each trip
	next();
});

const Trip = module.exports = mongoose.model('Trip', tripSchema);
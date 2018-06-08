const User                 = require('./user');
const Trip                 = require('./trip');
const validator            = require('validator');
const mongoodbErrorHandler = require('mongoose-mongodb-errors');
const mongoose             = require('mongoose');
const Schema               = mongoose.Schema;
      mongoose.Promise     = global.Promise;


const requestSchema = new Schema({
	name: {type: String,required: "You must supply a name"},
	email: {type: String,lowercase: true,trim: true,validate: [validator.isEmail, 'Invalid Email Address']},
	message: {type: String},
	company: {type: mongoose.Schema.ObjectId,ref: 'User',required: 'You must supply a company!'},
	user: {type: mongoose.Schema.ObjectId,ref: 'User',required: 'You must supply a user!'},
	trip: {type: mongoose.Schema.ObjectId,ref: 'Trip',required: "You must supply a trip"},
	status: {type: String,default: 'waiting'}
});

module.exports = mongoose.model('Request', requestSchema);
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const reviews = new Schema({
	id: {
    type: Number,
    required: true,
	},
	user_id: {
    type: Number,
    required: false,
	},
	name: {
    type: String,
    required: true
  },
  dealership: {
    type: Number,
    required: true,
  },
  review: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: false
  },
  purchase: {
    type: Boolean,
    required: true
  },
  purchase_date: {
    type: String,
    required: false
  },
  car_make: {
    type: String,
    required: false
  },
  car_model: {
    type: String,
    required: false
  },
  car_year: {
    type: Number,
    required: false
  },
});

module.exports = mongoose.model('reviews', reviews);

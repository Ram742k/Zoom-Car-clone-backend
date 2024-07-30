const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    images: {
        type: [String], // Array of image URLs
        required: true
    },
    title: String,
    price: Number,
    offprice: Number,
    transmission: String,
    fueltype: String,
    seat: Number,
    cartype: String,
    rating: Number,
    km: Number,
    location: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    availability:{
        type: Boolean,
        default: true
    },
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;

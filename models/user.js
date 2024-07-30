const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: {
        type: String,
        enum: ['user', 'admin','hoster'],
        default: 'user'
    },
    profilePicture: String
});

module.exports = mongoose.model('User', userSchema); // Export the User model
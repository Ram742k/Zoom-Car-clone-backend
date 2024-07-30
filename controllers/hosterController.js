const jwt = require('jsonwebtoken');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const { SECRET_KEY } = require('../utils/config');
const Booking = require('../models/booking');
const Vehicle = require('../models/vechicle');

const hosterController = {
    registerHoster: async (req, res) => {
        try {
          // get the user inputs from the request body
          const { name, email, password } = req.body;
    
          // check if the user already exists in the database with the same email
          const user = await User.findOne({ email });
    
          // if the user exists, return an error response
          if (user) {
            return res.status(400).send({ message: 'User already exists' });
          }
    
          // hash the password
          const hashedPassword = await bcrypt.hash(password, 10);
    
          // create a new user with the role set to 'hoster'
          const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: 'hoster', // Setting the role to 'hoster'
          });
          

          // save the user
          const savedUser = await newUser.save();
    
          res.status(201).send({
            message: 'Hoster created successfully',
            user: savedUser,
          });
        } catch (error) {
          res.status(500).send({ message: error.message });
        }
      },
      loginHoster: async (req, res) => {
        
        try {
            const { email, password } = req.body;
        
            // Find the hoster by email
            const hoster = await User.findOne({ email });
            
            if(!hoster) {
                return res.status(404).json({ message: 'User not found' });
            }
        
            // Compare the password with the hashed password in the database
            const passwordMatch = await bcrypt.compare(password, hoster.password);
            
            if (!passwordMatch) {
                return res.status(401).json({ message: 'Invalid password' });
            }
            // Check if the user's role is 'hoster'
            if (hoster.role !== 'hoster') {
                console.log('User is not a hoster');
              return res.status(403).json({ message: 'Access denied. User is not a hoster.' });
              
            }
        
            // Generate a JWT token
            const token = jwt.sign({ id: hoster._id }, SECRET_KEY, { expiresIn: '1h' });
            
            console.log(token);
            // Respond with the token
            res.json({ token });
          } catch (error) {
            res.status(500).json({ message: 'Error logging in', error });
          }
      },
      getBookings: async (req, res) => {
        try {
            const hosterId = req.userId;
    
            // Fetch all vehicles owned by the hoster
            const vehicles = await Vehicle.find({ owner: hosterId });
            
            // Extract the IDs of these vehicles
            const vehicleIds = vehicles.map(vehicle => vehicle._id);
            
            // Fetch all bookings associated with these vehicle IDs
            const bookings = await Booking.find({ car: { $in: vehicleIds } });
    
            res.json(bookings);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
    
}
module.exports = hosterController;
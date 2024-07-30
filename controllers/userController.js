    const User = require('../models/user');
    const Booking = require('../models/booking');
    const bcrypt = require('bcrypt');
    const jwt = require('jsonwebtoken');
    const { SECRET_KEY } = require('../utils/config');
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID, // Replace with your Razorpay key ID
        key_secret: process.env.RAZORPAY_KEY_SECRET // Replace with your Razorpay key secret
    });
    // define the contoller for the user
    const userController = {
        getAllUsers: async (request, response) => {
            try {
                const { email } = request.query;

                if (email) {
                    // find the user by email
                    const user = await User.findOne({ email });

                    if (!user) {
                        return response.status(404).send({ message: 'User not found' });
                    }

                    return response.status(200).json(user);
                }

                // if no query parameters are provided, return all users
                const users = await User.find();
                response.status(200).json(users);
            } catch (error) {
                response.status(500).send({ message: error.message });
            }
        },
        register: async (request, response) => {
            try {
                // get the user inputs from the request body
                const { name, email, password } = request.body;

                // check if the user already exists in the database with same email
                const user = await User.findOne({ email });

                // if the user exists, return an error response
                if (user) {
                    return response.status(400).send({ message: 'User already exists' });
                }

                // hash the password
                const hashedPassword = await bcrypt.hash(password, 10);

                // create a new user
                const newUser = new User({ name, email, password: hashedPassword });

                // save the user
                const savedUser = await newUser.save();

                response.status(201).send({
                    message: 'User created successfully',
                    user: savedUser
                });
            } catch (error) {
                response.status(500).send({ message: error.message });
            }
        },
        getUserById: async (request, response) => {
            try {
                // get the user id from the request parameters
                const userId = request.params.id;

                // find the user by id
                const user = await User.findById(userId);

                if (!user) {
                    return response.status(404).send({ message: 'User not found' });
                }

                response.status(200).json(user);
            } catch (error) {
                response.status(500).send({ message: error.message });
            }
        },

        login: async (request, response) => {
            try {
                // get the user email and password from the request body
                const { email, password } = request.body;

                // check if the user exists in the database
                const user = await User.findOne({ email });

                // if the user does not exist, return an error response
                if (!user) {
                    return response.status(404).send({ message: 'User not found' });
                }

                if (user && await bcrypt.compare(password, user.password)) {
                    const token = jwt.sign({ id: user._id }, 'APPLE');
                    response.json({ token });
                  } else {
                    response.status(401).json({ message: 'Invalid credentials' });
                  }
            } catch (error) {
                response.status(500).send({ message: error.message });
            }
        },

        logout: async (request, response) => {
            try {
                // clear the cookie
                response.clearCookie('token');

                response.status(200).send({ message: 'Logged out successfully' });
            } catch (error) {
                response.status(500).send({ message: error.message });
            }
        },

        updateUser: async (request, response) => {
            try {
                // get the user id from the request parameters
                const userId = request.params.id;

                // get the details to update from the request body
                const { name, email } = request.body;

                // find the user by id from the database
                const user = await User.findById(userId);

                // if the user does not exist, return an error response
                if (!user) {
                    return response.status(404).send({ message: 'User not found' });
                }

                // update the user details if they are provided and if the user exists
                if (name) user.name = name;
                if (email) user.email = email;

                // save the updated user details to the database
                const updatedUser = await user.save();

                response.status(200).json({ message: 'User updated successfully', user: updatedUser });
            } catch (error) {
                response.status(500).send({ message: error.message });
            }
        }, 

        deleteUser: async (request, response) => {
            try {
                // get the user id from the request parameters
                const userId = request.params.id;

                // find the user by id from the database
                const user = await User.findById(userId);

                // if the user does not exist, return an error response
                if (!user) {
                    return response.status(404).send({ message: 'User not found' });
                }

                // delete the user from the database
                await User.findByIdAndDelete(userId);

                response.status(200).send({ message: 'User deleted successfully' });
            } catch (error) {
                response.status(500).send({ message: error.message });
            }
        },
        getProfile: async (request, response) => {
            
            try {
                const user = await User.findById(request.userId);
                response.json(user);
                
            } catch (error) {
                response.status(500).send({ message: error.message });
            }
        },
        updateProfile: async (request, response) => {
            try {
                // get the user id from the request object
                const userId = request.userId;

                // get the details to update from the request body
                const { name, email } = request.body;

                // find the user by id from the database
                const user = await User.findById(userId);

                // if the user does not exist, return an error response
                if (!user) {
                    return response.status(404).send({ message: 'User not found' });
                }

                // update the user details if they are provided and if the user exists
                if (name) user.name = name;
                if (email) user.email = email;

                // save the updated user details to the database
                const updatedUser = await user.save();

                response.status(200).json({ message: 'User updated successfully', user: updatedUser });
            } catch (error) {
                response.status(500).send({ message: error.message });
            }
        },
        // set the profile picture
        setProfilePicture: async (req, res) => {
            try {
                if (!req.file) {
                    return res.status(400).json({ error: 'No file uploaded' });
                }

                const userId = req.userId;
                const profilePicture = req.file.path;

                const user = await User.findByIdAndUpdate(userId, { profilePicture }, { new: true });

                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }

                res.status(200).json({ user });
            } catch (error) {
                console.error('Error updating profile picture:', error);
                res.status(500).json({ error: 'Failed to update profile picture' });
            }
        },
        createOrder: async (req, res) => {
            const { amount, car } = req.body;
            const user = req.userId;
            // console.log(user);
        
            try {
                if (!car || !user || !amount) {
                    return res.status(400).send({ message: 'Required fields are missing' });
                }
        
                // Create an order in Razorpay
                const options = {
                    amount: amount * 100, // Razorpay expects the amount in paise
                    currency: 'INR',
                    receipt: `receipt_order_${Date.now()}`,
                };
                const order = await razorpay.orders.create(options);
        
                // Store booking details in the database
                const newBooking = new Booking({ car, user, amount });
        
                await newBooking.save();
        
                res.status(200).json({ order, bookingId: newBooking._id });
            } catch (error) {
                console.error('Error creating order:', error);
                res.status(500).send('Something went wrong');
            }
        }
    }

    module.exports = userController;
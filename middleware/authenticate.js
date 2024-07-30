const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../utils/config');
const User = require('../models/user');

const auth = {
    authenticate :(req, res, next) => {
        const token = req.headers['authorization'];
        // console.log('token', token);

        if (token) {
          jwt.verify(token,SECRET_KEY, (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Invalid token' });
            req.userId = decoded.id;
            next();
          });
        } else {
          res.status(401).json({ message: 'No token provided' });
        }
      },
    verifyToken: (request, response, next) => {
        try {
            console.log('verifyToken middleware called');
            // get the token from the cookie
            const token = request.headers['authorization'];
            console.log(token);

            // if the token does not exist, return an error
            if (!token) {
                return response.status(401).send({ message: 'Access denied' });
            }

            // verify the token
            try {
                const decodedToken = jwt.verify(token, SECRET_KEY);

                // set the user id in the request object
                request.userId = decodedToken.id;

                // call the next middleware
                next();
            } catch (error) {
                return response.status(401).send({ message: 'Invalid token' });
            }

        } catch (error) {
            response.status(500).send({ message: error.message });
        }
    },
    isAdmin: async (request, response, next) => {
        try {
            // get the user id from the request object
            const userId = request.userId;

            // find the user by id
            const user = await User.findById(userId);

            // if the user does not exist, return an error
            if (!user) {
                return response.status(404).send({ message: 'User not found' });
            }

            // if the user is not an admin, return an error
            if (user.role !== 'admin') {
                return response.status(403).send({ message: 'Access Forbidden' });
            }

            // call the next middleware
            next();
        } catch (error) {
            response.status(500).send({ message: error.message });
        }
    },
    
}

module.exports = auth;
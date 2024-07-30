const express = require('express');
const hosterRoutes = express.Router();
const hosterController = require('../controllers/hosterController');
const auth = require('../middleware/authenticate');

hosterRoutes.post('/register',hosterController.registerHoster);
hosterRoutes.post('/login',hosterController.loginHoster);
hosterRoutes.get('/bookings',auth.authenticate, hosterController.getBookings);

module.exports = hosterRoutes;
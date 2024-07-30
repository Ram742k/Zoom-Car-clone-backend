const express = require('express');
const bookingRouter = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/authenticate');

bookingRouter.get('/bookings/:id', bookingController.getMyBookings );
bookingRouter.post('/create-order', auth.authenticate, bookingController.createOrder);
bookingRouter.post('/cancel-booking/:id', auth.authenticate, bookingController.cancelBooking);
// bookingRouter.get('/bookings', auth.authenticate, bookingController.getAllBookings);
module.exports = bookingRouter;

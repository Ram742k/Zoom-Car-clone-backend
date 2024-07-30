const Razorpay = require('razorpay');
const Booking = require('../models/booking');
const axios = require('axios');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const bookingController = {
    createOrder: async (req, res) => { 
      const { car, userId, amount, dateRange, filterLocation } = req.body;
        try {
            if (!car || !userId || !amount) {
              return res.status(400).send({ message: 'Required fields are missing' });
            }
            const options = {
              amount: amount * 100,
              currency: 'INR',
              receipt: `receipt_order_${Date.now()}`,
            };
            const order = await razorpay.orders.create(options);
            const [startDate, endDate] = dateRange.split(' - ');
            const newBooking = new Booking({
              car,
              user: userId,
              amount,
              paymentId: order.id,
              filterLocation,
              startDate: new Date(startDate),
              endDate: new Date(endDate),
            });
            await newBooking.save();
            res.status(200).json({ order, bookingId: newBooking._id });
          } catch (error) {
            console.error('Error creating order:', error);
            res.status(500).send('Something went wrong');
          }
    },
    cancelBooking: async (req, res) => {
        try {
            const { id } = req.params;
            const booking = await Booking.findById(id).exec();
            if (!booking) {
              return res.status(404).json({ message: 'Booking not found' });
            }
            const paymentResponse = await axios.get(`https://api.razorpay.com/v1/orders/${booking.paymentId}/payments`, {
              auth: {
                username: process.env.RAZORPAY_KEY_ID,
                password: process.env.RAZORPAY_KEY_SECRET
              }
            });
            const paymentId = paymentResponse.data.items[0].id;
            const refundResponse = await axios.post(
              `https://api.razorpay.com/v1/payments/${paymentId}/refund`,
              {
                amount: booking.amount * 100,
                currency: 'INR'
              },
              {
                auth: {
                  username: process.env.RAZORPAY_KEY_ID,
                  password: process.env.RAZORPAY_KEY_SECRET
                }
              }
            );
            booking.paymentStatus = 'Cancelled';
            booking.refundId = refundResponse.data.id;
            await booking.save();
            res.json({ message: 'Booking cancelled and refund initiated', refund: refundResponse });
          } catch (error) {
            console.error('Error cancelling booking:', error);
            res.status(500).json({ message: 'Internal server error' });
          }
    },
    getMyBookings: async (req, res) => {
      const  userId  = req.params.id;
      console.log(userId);
      try {
          const bookings = await Booking.find({ user: userId });
          res.status(200).json(bookings);
          // console.log(bookings);
      } catch (error) {
          res.status(400).json({ error: error.message });
      }
    }
};

module.exports = bookingController;


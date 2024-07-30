const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const multer = require('multer');

const userRouter = require('./routes/userRoutes');
const vehicleRouter = require('./routes/vechicleRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const hosterRoutes = require('./routes/hosterRoutes');

const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5174', // Adjust to match your frontend URL
    credentials: true
}));
app.use(cookieParser());

mongoose.connect('mongodb+srv://ramsundaram370:Ram12345@cluster0.1novklf.mongodb.net/zoomcar')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/vehicles', vehicleRouter);
app.use('/users', userRouter);
app.use('/bookings', bookingRouter);
app.use('/hoster', hosterRoutes);

app.listen(5000, () => console.log('Server running on port 5000'));

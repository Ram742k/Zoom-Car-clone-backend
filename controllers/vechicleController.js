const fs = require('fs');
const path = require('path');
const Vehicle = require('../models/vechicle');
const Booking = require('../models/booking');

const vehicleController = {
    addVehicle: async (req, res) => {
        try {
            console.log('Request files:', req.files);
            const { title, price, offprice, transmission, fueltype, seat, cartype, rating, km, location } = req.body;
            let images = [];
            if (req.files) {
                images = req.files.map(file => `https://zoom-car-clone-backend.onrender.com/uploads/${file.filename}`);
                console.log('Image URLs:', images); // Log image URLs
            }
            const vehicle = new Vehicle({
                images,
                title,
                price,
                offprice,
                transmission,
                fueltype,
                seat,
                cartype,
                rating,
                km,
                location,
                owner: req.userId
            });
            
            console.log(vehicle);
            const createdVehicle = await vehicle.save();
            res.json(createdVehicle);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    getVehicles: async (req, res) => {
        try {
            const userId = req.userId;
            const vehicles = await Vehicle.find({ owner: userId });
            res.json(vehicles);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    updateVehicles: async (req, res) => {
        try {
            const { title, price, offprice, transmission, fueltype, seat, cartype, rating, km, location } = req.body;
            let images = [];
            if (req.files) {
                images = req.files.map(file => `https://zoom-car-clone-backend.onrender.com/uploads/uploads/${file.filename}`);
            }
            const updatedVehicle = await Vehicle.findByIdAndUpdate(req.params.id, {
                images,
                title,
                price,
                offprice,
                transmission,
                fueltype,
                seat,
                cartype,
                rating,
                km,
                location,
            }, { new: true });
            res.json(updatedVehicle);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    deleteVehicles: async (req, res) => {
        try {
            const vehicle = await Vehicle.findById(req.params.id);
            if (!vehicle) {
                return res.status(404).json({ error: 'Vehicle not found' });
            }

            vehicle.images.forEach(imagePath => {
                const filePath = path.join(__dirname, '..', 'uploads', path.basename(imagePath));
                fs.unlink(filePath, err => {
                    if (err) {
                        console.error(`Error deleting image: ${filePath}`, err);
                    }
                });
            });

            await Vehicle.findByIdAndDelete(req.params.id);
            res.json({ message: 'Vehicle and images deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    getAllVehicles: async (req, res) => {
        
        try {
            const vehicles = await Vehicle.find();
            res.json(vehicles);
        } catch (err) {
            res.status(500).send(err.message);
        }
    },
    getAvailableVehicles: async (req, res) => {
        console.log('getAvailableVehicles');
        try {
            const { location,cartype, fueltype, minPrice, maxPrice} = req.query;
            const locationSplit = location.split(','); // Split by comma
            const city = locationSplit[0].trim();
            // console.log(city);  
            const query = {
                availability: true, 
                ...(location && { location: new RegExp(city, 'i') }), // case-insensitive search
                ...(cartype && { cartype: new RegExp(cartype, 'i') }),
                ...(fueltype && { fueltype: new RegExp(fueltype, 'i') }),
                ...(minPrice && { price: { $gte: parseFloat(minPrice) } }),
                ...(maxPrice && { price: { $lte: parseFloat(maxPrice) } })
            };

            const availableVehicles = await Vehicle.find(query);
        res.json(availableVehicles);
        } catch (err) {
            res.status(500).send(err.message);
        }
    },
    checkBooking: async (req, res) =>{
        console.log('checkBooking');
        console.log(req.query);
        const { carId, startDate, endDate } = req.query;
        if (!carId || !startDate || !endDate) {
          return res.status(400).json({ message: 'Missing required parameters' });
        }
        try {
            console.log('checkBooking');
          const start = new Date(startDate);
          const end = new Date(endDate);
          const bookings = await Booking.find({
            car: carId,
            startDate: { $lte: end },
            endDate: { $gte: start }
          });
          const isBooked = bookings.length > 0;
          res.json({ isBooked });
        } catch (error) {
          console.error('Error checking booking:', error);
          res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    fetchVehicles: async (req, res) => {
        try {
            const vehicles = await Vehicle.find();
            res.status(200).json(vehicles);
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
    },
    getVehicleById: async (req, res) => {
        try {
            console.log('getVehicleById');
            const vehicle = await Vehicle.findById(req.params.carId);
            if (!vehicle) {
              return res.status(404).json({ error: 'Car not found' });
            }
            res.json(vehicle);
          } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
          }
    },
   
};

module.exports = vehicleController;

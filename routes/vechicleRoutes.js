const express = require('express');
const vehicleRouter = express.Router();
const vehicleController = require('../controllers/vechicleController');
const auth = require('../middleware/authenticate');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2000000 }, // Limit file size to 2MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb('Error: Images Only!');
        }
    }
});

vehicleRouter.post('/', auth.authenticate, upload.array('images', 10),vehicleController.addVehicle);
vehicleRouter.put('/:id',auth.authenticate,upload.array('images', 10),vehicleController.updateVehicles);
vehicleRouter.delete('/:id', auth.authenticate, vehicleController.deleteVehicles);
vehicleRouter.get('/',  auth.authenticate,vehicleController.getVehicles);
vehicleRouter.get('/available',vehicleController.getAvailableVehicles);
vehicleRouter.get('/check-booking',auth.authenticate, vehicleController.checkBooking);
vehicleRouter.get('/:carId', auth.authenticate, vehicleController.getVehicleById);



module.exports = vehicleRouter;

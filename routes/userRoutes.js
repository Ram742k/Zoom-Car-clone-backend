const express = require('express');
const userRouter = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authenticate');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

userRouter.post('/register', userController.register);
userRouter.post('/login', userController.login);
userRouter.get('/profile', auth.authenticate, userController.getProfile);
userRouter.put('/profile', auth.authenticate, userController.updateProfile);
userRouter.put('/profile/picture', auth.authenticate, upload.single('picture'), userController.setProfilePicture);
userRouter.delete('/profile', auth.authenticate, userController.deleteUser);

module.exports = userRouter;

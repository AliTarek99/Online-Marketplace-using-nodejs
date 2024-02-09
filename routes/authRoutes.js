const express = require('express');

const authController = require('../Controllers/auth');

const route = express.Router();

route.get('/login', authController.getLogin);

route.post('/login', authController.postLogin);

route.get('/register', authController.getRegister);

route.post('/register', authController.postRegister);

route.use('/logout', authController.logout);

route.get('/verify/:userId', authController.getVerify);

route.get('/reset', authController.getResetPass);

route.post('/reset', authController.postResetPass);

route.get('/reset/:token', authController.getNewPass);

route.post('/new-password', authController.postNewPass);

module.exports = route;
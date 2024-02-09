const express = require('express');
const { check } = require('express-validator')

const authController = require('../Controllers/auth');

const route = express.Router();

route.get('/login', authController.getLogin);

route.post('/login', authController.postLogin);

route.get('/register', authController.getRegister);

route.post('/register', [check('email').isEmail().withMessage('Wrong email format.'), check('password').isLength({min: 8}).withMessage('Password must be at least 8 charaters')] , authController.postRegister);

route.use('/logout', authController.logout);

route.get('/verify/:userId', authController.getVerify);

route.get('/reset', authController.getResetPass);

route.post('/reset', authController.postResetPass);

route.get('/reset/:token', authController.getNewPass);

route.post('/new-password', check('password').isLength({min: 8}).withMessage('Password must be at least 8 charaters'), authController.postNewPass);

module.exports = route;
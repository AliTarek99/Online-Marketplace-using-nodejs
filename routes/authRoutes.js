const express = require('express');
const User = require('../Models/user');
const { check } = require('express-validator')

const authController = require('../Controllers/auth');

const route = express.Router();

route.get('/login', authController.getLogin);

route.post('/login', authController.postLogin);

route.get('/register', authController.getRegister);

route.post('/register', 
    [
        check('email').isEmail().withMessage('Wrong email format.'), 
        check('password').isLength({min: 8}).withMessage('Password must be at least 8 charaters'),
        check('repeatPassword').custom((value, {req}) => {
            if(value != req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
        check('email').custom(value => {
            return User.findOne({email: value})
            .then(user => {
                if(user) {
                    return Promise.reject('Email already exists');
                }
                // return true;
            });
        })
    ],
    authController.postRegister);

route.use('/logout', authController.logout);

route.get('/verify/:userId', authController.getVerify);

route.get('/reset', authController.getResetPass);

route.post('/reset', authController.postResetPass);

route.get('/reset/:token', authController.getNewPass);

route.post('/new-password', check('password').isLength({min: 8}).withMessage('Password must be at least 8 charaters'), authController.postNewPass);

module.exports = route;
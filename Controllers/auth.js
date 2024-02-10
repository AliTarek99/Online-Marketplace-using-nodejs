const User = require('../Models/user');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const crypto = require('crypto');
const { validationResult } = require('express-validator');

const apiKey = '45dc56f3e085146993094f22023a73d5', apiSecret = '9eb2da71249577593a3edbb7e371f13b';

exports.getLogin = (req, res) => {
    let error = req.session.error;
    req.session.error = undefined;
    return res.render('auth/login', {
        title: 'Login', 
        path: '/login', 
        err: error, 
        auth: (req.session.user? 1: 0), 
        verified: ((req.session.user && req.session.user.verified)? 1 : 0),
        oldData: {
            email: ''
        }
    });
}

exports.postLogin = (req, res) => {
    User.findOne({email: req.body.email})
    .then(user => {
        bcrypt.compare(req.body.password, user.password).then(result => {
            if(user && result) {
                req.session.user = user;
                return req.session.save(() => res.redirect('/'));
            }
            return req.session.save(() => res.render('auth/login', {
                title: 'Login', 
                path: '/login', 
                err: 'Wrong credentials.', 
                auth: (req.session.user? 1: 0), 
                verified: ((req.session.user && req.session.user.verified)? 1 : 0),
                oldData: {
                    email: req.body.email
                }
            }));
        });
    })
    .catch(err => console.log(err));
}

exports.getRegister = (req, res) => {
    let error = req.session.error;
    req.session.error = undefined;
    return res.render('auth/register', {
        title: 'Register', 
        path: '/register', 
        err: error, 
        auth: (req.session.user? 1: 0), 
        verified: ((req.session.user && req.session.user.verified)? 1 : 0),
        oldData: {
            name: '',
            email: ''
        },
        validationErrors: []
    });
}

exports.postRegister = (req, res) => {
    const error = validationResult(req);
    if(!error.isEmpty()) {
        console.log(error.array());
        return res.render('auth/register', {
            title: 'Register', 
            path: '/register', 
            err: error.array(), 
            auth: (req.session.user? 1: 0), 
            verified: ((req.session.user && req.session.user.verified)? 1 : 0),
            oldData: {
                name: req.body.name,
                email: req.body.email
            },
            validationErrors: error.array()
        });
    }
    if(req.body.password == req.body.repeatPassword) {
        let user = new User();
        user.name = req.body.name;
        user.email = req.body.email;
        user.verified = false;
        bcrypt.hash(req.body.password, 12).then(result => {
            user.password = result;
            user.cart = [];
            return user.save();
        }).then(() => {
            sendEmail({
                to: user.email,
                toName: user.name, 
                subject: "Email verification", 
                textPart: 'Click here to verify your account verify TEXT',
                htmlPart: 
                `<body>
                    Click here to verify your account
                    <br>
                    <a href="http://localhost:3000/verify/${user._id}">Verify</a>
                </body>`
            });
            req.session.user = user;
            return req.session.save(() => res.redirect('/'));
        }).catch(err => console.log(err));
    }
}

exports.logout = (req, res) => {
    if(req.session) {
        req.session.destroy(err =>{
            
            return res.redirect('/login');
        });
    }
}

exports.getVerify = (req, res) => {
    User.findById(req.params.userId)
    .then((user) => {
        let msg;
        if(user && !user.verified) {
            user.verified = true;
            user.save();
            msg = "Your account has been verified.";
        }
        else {
            msg = "Something went wrong.";
        }
        res.render('auth/verify', {title: 'Verify', path: '/verify', message: msg, auth: (req.session.user? 1: 0), verified: ((user && user.verified)? 1 : 0)});
    })
}

exports.getResetPass = (req, res) => {
    let err = req.session.error;
    req.session.error = undefined;
    res.render('auth/reset', {title: 'Reset Password', path: '/reset', error: err, auth: 0, verified: 0});
}

exports.postResetPass = (req, res) => {
    User.findOne({email: req.body.email})
    .then(user => {
        if(user) {
            crypto.randomBytes(32, (err, buf) => {
                user.resetToken = buf.toString('hex');
                user.tokenExpiry = Date.now() + 3600000;
                user.save()
                .then(user => {
                    sendEmail({
                        to: user.email,
                        toName: user.name, 
                        subject: "Password Reset", 
                        textPart: 'Click here to change your password',
                        htmlPart: 
                        `<body>
                            Click here to change your password if you did not request to change it just ignore this email. it is only valid for one hour.
                            <br>
                            <a href="http://localhost:3000/reset/${user.resetToken}">Change password</a>
                        </body>`
                    })
                }).catch(err => console.log(err));
            });
        }
    }).catch(err => console.log(err));
    
    res.render('auth/login', {
        title: 'Login', 
        path: '/login', 
        err: 'If email address exists you will recieve an email',
        auth: (req.session.user? 1: 0), 
        verified: ((req.session.user && req.session.user.verified)? 1 : 0)
    });
}

exports.getNewPass = (req, res) => {
    User.findOne({resetToken: req.params.token, tokenExpiry: {$gt: Date.now()}})
    .then(user => {
        if(!user) {
            return res.redirect('/');
        }
        req.session.token = req.params.token;
        req.session.email = user.email;
        let err = req.session.error;
        req.session.error = undefined;
        req.session.save(() => res.render('auth/new-password', {title: 'Reset Password', path: '/reset', error: (err? err: ''), auth: 0, verified: 0}));  
    });
}

exports.postNewPass = (req, res) => {
    const error = validationResult(req);
    if(!error.isEmpty()) {
        return res.render('auth/new-password', {
            title: 'Reset Password', 
            path: '/reset', 
            error: error.array()[0].msg, 
            auth: 0, 
            verified: 0
        });
    }
    User.findOne({email: req.session.email, resetToken: req.session.token, tokenExpiry: {$gt: Date.now()}})
    .then(user => {
        if(user) {
            if(req.body.password == req.body.repeatPassword) {
                bcrypt.hash(req.body.password, 12)
                .then(hashedPass => {
                    user.resetToken = undefined;
                    user.tokenExpiry = undefined;
                    user.password = hashedPass;
                    return user.save();
                })
                .then(user => {
                    sendEmail({
                        to: user.email,
                        toName: user.name, 
                        subject: "Password Changed", 
                        textPart: 'Your password has been changed successfully.',
                        htmlPart: 
                        `<body>
                            <p>Your password has been changed successfully.</p>
                        </body>`
                    })
                    req.session.token = undefined;
                    req.session.email = undefined;
                    return req.session.save(() => res.redirect('/login'));
                })
                .catch(err => console.log(err));
            }
            else {
                req.session.error = 'passwords does not match';
                return req.session.save(() => res.redirect(`/reset/${user.resetToken}`));
            }
        }
        else {
            return res.redirect('/');
        }
    });
}

function sendEmail(email) {
    const data = {
        Messages: [
            {
                From: {
                    Email: 'alitarek5120@gmail.com',
                    Name: 'Market'
                },
                To:[{
                        Email: email.to,
                        Name: email.toName
                }],
                Subject: email.subject,
                TextPart: email.textPart,
                HTMLPart: email.htmlPart
            }
        ]
    };
    axios.post('https://api.mailjet.com/v3.1/send', data, {
        auth:{
            username: apiKey,
            password: apiSecret
        }
    })
}
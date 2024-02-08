const User = require('../Models/user');
const bcrypt = require('bcryptjs');
const axios = require('axios');

const apiKey = '45dc56f3e085146993094f22023a73d5', apiSecret = '9eb2da71249577593a3edbb7e371f13b';

exports.getLogin = (req, res) => {
    let error = req.session.error;
    req.session.error = '';
    return res.render('auth/login', {title: 'Login', path: '/login', err: error, auth: (req.session.user? 1: 0)});
}

exports.postLogin = (req, res) => {
    User.findOne({email: req.body.email})
    .then(user => {
        bcrypt.compare(req.body.password, user.password).then(result => {
            if(user && result) {
                req.session.user = user;
                return req.session.save(() => res.redirect('/'));
            }
            req.session.error = 'Wrong credentials.\n';
            return req.session.save(() => res.redirect('/login'));
        });
    })
    .catch(err => console.log(err));
}

exports.getRegister = (req, res) => {
    let error = req.session.error;
    req.session.error = '';
    return res.render('auth/register', {title: 'Register', path: '/register', err: error, auth: (req.session.user? 1: 0)});
}

exports.postRegister = (req, res) => {
    User.findOne({email: req.body.email})
    .then(user => {
        if(!user && req.body.password == req.body.repeatPassword) {
            user = new User();
            user.name = req.body.name;
            user.email = req.body.email;
            user.verified = false;
            bcrypt.hash(req.body.password, 12).then(result => {
                user.password = result;
                user.cart = [];
                return user.save();
            }).then(() => User.findOne({email: req.body.email}))
            .then(user => {
                const data = {
                    Messages: [
                        {
                            From: {
                                Email: 'alitarek5120@gmail.com',
                                Name: 'Market'
                            },
                            To:[{
                                    Email: user.email,
                                    Name: user.name
                            }],
                            Subject: "Email verification",
                            TextPart: 'Click here to verify your account verify TEXT',
                            HTMLPart: 
                                `<body>
                                    Click here to verify your account
                                    <br>
                                    <a href="http://localhost:3000/verify/${user._id}">Verify</a>
                                </body>`
                            
                        }
                    ]
                };
                axios.post('https://api.mailjet.com/v3.1/send', data, {
                    auth:{
                        username: apiKey,
                        password: apiSecret
                    }
                }).then(err => console.log(err));
                req.session.user = user;
                return res.redirect('/');
            }).catch(err => console.log(err));
        }
        else {
            req.session.error = (user ? 'Email already exists\n': 'Passwords do not match\n');
            return res.redirect('/register');
        }
    })
    .catch(err => console.log(err));
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
        return res.render('auth/verify', {title: 'verify', path: '/verify', message: msg, auth: (req.session.user? 1: 0)});
    })
}
const User = require('../Models/user');
const bcrypt = require('bcryptjs');

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
            bcrypt.hash(req.body.password, 12).then(result => {
                user.password = result;
                user.cart = [];
                return user.save();
            }).then(() => {
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
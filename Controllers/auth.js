const User = require('../Models/user');

exports.getLogin = (req, res) => {
    let error = req.session.error;
    req.session.error = '';
    return res.render('auth/login', {title: 'Login', path: '/login', err: error, auth: (req.session.user? 1: 0)});
}

exports.postLogin = (req, res) => {
    User.findOne({email: req.body.email})
    .then(user => {
        if(user && req.body.password == user.password) {
            req.session.user = user;
            return req.session.save(() => res.redirect('/'));
        }
        req.session.error = 'Wrong credentials.\n';
        return req.session.save(() => res.redirect('/login'));
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
            user.password = req.body.password;
            user.cart = [];
            user.save()
            .then(() => {
                req.session.user = user;
                return res.redirect('/');
            })
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
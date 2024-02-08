const path = require('path');

const express = require('express');
const bp = require('body-parser');
const mongoose = require('mongoose');

const rootDir = require('./util/path')
const adminRoutes = require('./routes/adminRoutes');
const shopRoutes = require('./routes/shopRoutes');
const authRoutes = require('./routes/authRoutes');
// const mongoClient = require('./util/database');
const Product = require('./Models/products');
const User = require('./Models/user');
const session = require('express-session');
const sessionMongo = require('connect-mongodb-session')(session);
const csrf = require('csrf-csrf');

restrictedRoutes = ['/admin/add-product', '/cart', '/order', '/admin/admin-products', '/add-to-cart', '/remove-from-cart', '/logout', '/admin/delete-product', '/admin/edit-product'];

const dbURL = 'mongodb+srv://alitarek:0000@cluster0.yt1qvle.mongodb.net/test?retryWrites=true&w=majority';

const store = new sessionMongo({
    uri: dbURL,
    collection: 'sessions'
});
const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(session({
    secret: 'ha4jk1245kj320dfj1$sfg', 
    resave: false, 
    saveUninitialized: false, 
    store: store
}));

app.use(express.static('public'));

app.use((req, res, next) => {
    //let csrfToken = generateToken(req, res);
    
    if(req.session.user) {
        User.findById(req.session.user._id)
        .then(user => {
            req.session.user = user;
            next();
        })
        .catch(err => console.log(err));
    }
    else
        next();
});

app.use((req, res, next) => {
    if(req.session.error == undefined) 
        req.session.error = '';
    if((req.url == '/login' || req.url == '/register') && req.method == 'POST')
        return next();
    else if(req.url != '/login' && req.url != '/register') {
        if((!req.session.user || !req.session.user.verified) && restrictedRoutes.filter(value => value == req.url.substring(0, value.length)).length) return res.redirect('/');
        return next();
    }
    else if((req.url == '/login' || req.url == '/register') && req.session.user) {
        return res.redirect('/');
    }
    else {
        return next();
    }
});

app.use(bp.urlencoded({extended : false}));
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use('/', (req, res) => {
    res.render('404', {title : "Page Not Found", path : "/404", auth: false});
});

mongoose.connect(dbURL)
.then(() => app.listen(3000))
.catch(err => console.log(err));
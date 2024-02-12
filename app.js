const path = require('path');
const fs = require('fs');

const express = require('express');
const bp = require('body-parser');
const mongoose = require('mongoose');

const adminRoutes = require('./routes/adminRoutes');
const shopRoutes = require('./routes/shopRoutes');
const authRoutes = require('./routes/authRoutes');
// const mongoClient = require('./util/database');
const Product = require('./Models/products');
const Order = require('./Models/order');
const User = require('./Models/user');
const session = require('express-session');
const sessionMongo = require('connect-mongodb-session')(session);
const csrf = require('csrf-csrf');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join('Data', 'ProductImages'));
    },
    filename: function (req, file, cb) {
        cb(null, `${new Date().getTime()}-${file.originalname}`);
    }
});
const upload = multer({
    storage: storage, 
    fileFilter: (req, file, cb) => {
        if(file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
            cb(null, true);
        }
        else {
            cb(null, false);
        }
    }
});

restrictedRoutes = ['/admin/add-product', '/cart', '/order', '/admin/admin-products', '/add-to-cart', '/remove-from-cart', '/logout', '/admin/delete-product', '/admin/edit-product'];

const dbURL = 'mongodb+srv://alitarek:0000@cluster0.yt1qvle.mongodb.net/test?retryWrites=true&w=majority';

const store = new sessionMongo({
    uri: dbURL,
    collection: 'sessions'
});
const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(upload.single('image'));
app.use(bp.urlencoded({extended : false}));

app.use(session({
    secret: 'ha4jk1245kj320dfj1$sfg', 
    resave: false, 
    saveUninitialized: false, 
    store: store
}));

app.use(express.static('public'));
app.use('/Data/invoices', (req, res, next) => {
    console.log(req.originalUrl.split('-')[1].split('.')[0]);
    Order.findById(new mongoose.Types.ObjectId(req.originalUrl.split('-')[1].split('.')[0]))
    .then(order => {
        if(!order || order.userId.toString() != req.session.user._id.toString()){
            return res.redirect('/orders');
        }
        res.setHeader('Content-Type', 'application/pdf');
        next();
    }).catch(err => next(err))
}, express.static(path.join('Data', 'invoices')));
app.use('/Data/ProductImages', (req, res, next) => {
    res.setHeader('Content-Type', 'image/png');
    next();
}, express.static(path.join('Data', 'ProductImages')));

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
        if((!req.session.user || (!req.session.user.verified && req.url != '/logout')) && restrictedRoutes.filter(value => value == req.url.substring(0, value.length)).length) return res.redirect('/');
        return next();
    }
    else if((req.url == '/login' || req.url == '/register') && req.session.user) {
        return res.redirect('/');
    }
    else {
        return next();
    }
});


app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use('/', (req, res) => {
    res.render('404', {title : "Page Not Found", path : "/404", auth: false});
});

app.use((error, req, res, next) => {
    console.log(error);
    res.render('500', {title : "Something went wrong!", path : "/500", auth: false})
})

mongoose.connect(dbURL)
.then(() => app.listen(3000))
.catch(err => console.log(err));
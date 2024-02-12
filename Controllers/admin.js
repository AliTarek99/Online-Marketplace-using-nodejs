const Product = require('../Models/products');
const { validationResult } = require('express-validator');
const path = require('path');


const MAX_PRODUCTS_PER_PAGE = 10;

exports.getAddProduct = (req, res, next) => {
    return res.render('admin/add-product', {
        title: 'Add Product', 
        path: '/admin/add-product', 
        err: [],
        product: {id: null},
        auth: (req.session.user? 1: 0), 
        verified: ((req.session.user && req.session.user.verified)? 1 : 0),
        invalidFile: false
    });
};

exports.getProducts = (req, res, next) => {
    let currentPage = (+req.query.page || 1);
    Product.find({userId: req.session.user._id}).count()
    .then(count => {
        Product.find({userId: req.session.user._id})
        .skip((currentPage - 1) * MAX_PRODUCTS_PER_PAGE)
        .limit(MAX_PRODUCTS_PER_PAGE)
        .then(result => {
            return res.render('admin/products', {
                title : "Products",
                prods : result,
                path : '/admin/products',
                lastPage: Math.ceil(count / MAX_PRODUCTS_PER_PAGE),
                currentPage: currentPage,
                auth: (req.session.user? 1: 0),
                verified: ((req.session.user && req.session.user.verified)? 1 : 0)
            });
        })
    })
    .catch(err => next(err));
};

exports.deleteProduct = (req, res, next) => {
    Product.findOneAndDelete({_id: req.params.prodId, userId: req.session.user._id})
    .then(() => res.redirect('/admin/products'))
    .catch(err => next(err));
}

exports.getEdit = (req, res, next) => {
    Product.findById(req.params.prodId)
    .then(product => {
        if(!product || !req.session.user || product.userId.toString() != req.session.user._id.toString()) return res.redirect('/admin/products');
        return res.render('admin/add-product', {
            title: 'Edit Product', 
            path: '/admin/add-product', 
            err: [],
            product: p, 
            auth: (req.session.user? 1: 0), 
            verified: ((req.session.user && req.session.user.verified)? 1 : 0),
            invalidFile: false
        });
    })
    .catch(err => next(err));;
}

exports.postEdit = (req, res, next) => {
    Product.findById(req.params.prodId)
    .then(p => {
        if(!req.session.user || (p && p.userId.toString() != req.session.user._id.toString())) return res.redirect('/admin/products');
        const error = validationResult(req);
        if(!error.isEmpty()) {
            return res.render('admin/add-product', {
                title: 'Edit Product', 
                path: '/admin/add-product', 
                err: error.array(),
                product: {
                    title: req.body.title,
                    price: req.body.price,
                    quantity: req.body.quantity,
                    description: req.body.description
                }, 
                auth: (req.session.user? 1: 0), 
                verified: ((req.session.user && req.session.user.verified)? 1 : 0),
                invalidFile: (error.array().find(value => value == 'image')? true: false)
            });
        }
        if(!p) p = new Product();
        const image = req.file;
        p.title = req.body.title;
        p.price = req.body.price;
        p.quantity = req.body.quantity;
        p.description = req.body.description;
        p.imgUrl = image.path;
        p.userId = req.session.user._id;
        return p.save();
    })
    .then(() => res.redirect('/admin/products'))
    .catch(err => next(err));
}
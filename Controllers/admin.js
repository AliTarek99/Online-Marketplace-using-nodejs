const Product = require('../Models/products');
const { validationResult } = require('express-validator');
const path = require('path');
const products = require('../Models/products');
const fs = require('fs');


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
    Product.find({_id: req.params.prodId, userId: req.session.user._id}).then(p => {
        fs.rm(p[0].imgUrl, () => {
            Product.findOneAndDelete({_id: req.params.prodId, userId: req.session.user._id})
            .then(() => res.status(200).json({successful: true}))
            .catch(err => res.status(500).json({successful: false}));
        });
    })
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
            product: product,
            auth: (req.session.user? 1: 0),
            verified: ((req.session.user && req.session.user.verified)? 1 : 0),
            invalidFile: false
        });
    })
    .catch(err => next(err));
}

exports.postEdit = (req, res, next) => {
    Product.findById(req.params.prodId)
    .then(p => {
        if(!req.session.user || (p && p.userId.toString() != req.session.user._id.toString())) return res.redirect('/admin/products');
        const error = validationResult(req).array();
        if(!p && !req.file)
            error.push({msg: 'Invalid file type!'});
        if(error.length) {
            res.render('admin/add-product', {
                title: 'Edit Product', 
                path: `/admin/add-product/${(p? p._id.toString(): '')}`, 
                err: error,
                product: {
                    _id: (p? p._id.toString(): ''),
                    title: req.body.title,
                    price: req.body.price,
                    quantity: req.body.quantity,
                    description: req.body.description
                }, 
                auth: (req.session.user? 1: 0), 
                verified: ((req.session.user && req.session.user.verified)? 1 : 0),
                invalidFile: (error.find(value => value == 'image')? true: false)
            });
            return false;
        }
        if(!p) p = new Product();
        const image = req.file;
        p.title = req.body.title;
        p.price = req.body.price;
        p.quantity = req.body.quantity;
        p.description = req.body.description;
        if(image)
            p.imgUrl = image.path;
        p.userId = req.session.user._id;
        return p.save();
    })
    .then(result => {
        if(result !== false) 
            res.redirect('/admin/products')
    })
    .catch(err => next(err));
}
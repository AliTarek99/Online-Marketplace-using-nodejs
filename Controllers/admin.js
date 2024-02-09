const Product = require('../Models/products');
const { validationResult } = require('express-validator');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/add-product', {title : "Add Product", path : '/admin/add-product', product: {id: null}, auth: (req.session.user? 1: 0), verified: ((req.session.user && req.session.user.verified)? 1 : 0)});
};

exports.getProducts = (req, res) => {
    Product.find({userId: req.session.user._id}).then(result => {
        res.render('admin/products', {title : "Products", prods : result, path : '/admin/products', auth: (req.session.user? 1: 0), verified: ((req.session.user && req.session.user.verified)? 1 : 0)})
    })
    .catch(err => console.log(err));
};

exports.deleteProduct = (req, res) => {
    Product.findOneAndDelete({_id: req.params.prodId, userId: req.session.user._id})
    .then(() => res.redirect('/admin/products'))
    .catch(err => console.log(err));
}

exports.getEdit = (req, res) => {
    Product.findById(req.params.prodId)
    .then(product => {
        if(!product || !req.session.user || product.userId.toString() != req.session.user._id.toString()) return res.redirect('/admin/products');
        res.render('admin/add-product', {title: 'Edit Product', path: '/admin/products', product: product, auth: (req.session.user? 1: 0), verified: ((req.session.user && req.session.user.verified)? 1 : 0)})
    })
    .catch(err => console.log(err));
}

exports.postEdit = (req, res) => {
    Product.findById(req.params.prodId)
    .then(p => {
        if(!req.session.user || (p && p.userId.toString() != req.session.user._id.toString())) return res.redirect('/admin/products');
        const error = validationResult(req);
        if(!error.isEmpty()) {
            return res.render('admin/add-product', {
                title: 'Edit Product', 
                path: '/admin/products', 
                error: error.array()[0].msg,
                product: p, 
                auth: (req.session.user? 1: 0), 
                verified: ((req.session.user && req.session.user.verified)? 1 : 0)
            });
        }
        if(!p) p = new Product();
        p.title = req.body.title;
        p.price = req.body.price;
        p.quantity = req.body.quantity;
        p.description = req.body.description;
        p.imgUrl = req.body.imgUrl;
        p.userId = req.session.user._id;
        return p.save();
    })
    .then(() => res.redirect('/admin/products'))
    .catch(err => console.log(err));
}
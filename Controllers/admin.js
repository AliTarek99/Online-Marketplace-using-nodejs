const Product = require('../Models/products');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/add-product', {title : "Add Product", path : '/admin/add-product', product: {id: null}, auth: (req.session.user? 1: 0), verified: ((req.session.user && req.session.user.verified)? 1 : 0)});
};

exports.getProducts = (req, res) => {
    Product.find().then(result => {
        res.render('admin/products', {title : "Products", prods : result, path : '/admin/products', auth: (req.session.user? 1: 0), verified: ((req.session.user && req.session.user.verified)? 1 : 0)})
    })
    .catch(err => console.log(err));
};

exports.deleteProduct = (req, res) => {
    Product.findByIdAndRemove(req.params.prodId)
    .then(() => res.redirect('/admin/products'))
    .catch(err => console.log(err));
    
}

exports.getEdit = (req, res) => {
    Product.findById(req.params.prodId)
    .then(product => {
        if(!product) return res.redirect('/admin/products');
        res.render('admin/add-product', {title: 'Edit Product', path: '/admin/products', product: product, auth: (req.session.user? 1: 0), verified: ((req.session.user && req.session.user.verified)? 1 : 0)})
    })
    .catch(err => console.log(err));
}

exports.postEdit = (req, res) => {
    Product.findById(req.params.prodId)
    .then(p => {
        p.title = req.body.title;
        p.price = req.body.price;
        p.quantity = req.body.quantity;
        p.description = req.body.description;
        p.imgUrl = req.body.imgUrl;
        return p.save()
    })
    .then(() => res.redirect('/admin/products'))
    .catch(err => console.log(err));
}
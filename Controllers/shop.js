const Product = require('../Models/products');
const Order = require('../Models/order');
const path = require('path')
const fs = require('fs');
const pdfDocument = require('pdfkit');

exports.getHome = (req, res, next) => {
    Product.find().then(result => {
        res.render('shop/product-list', {title : "Products", prods : result, path : '/', auth: (req.session.user? 1: 0), verified: ((req.session.user && req.session.user.verified)? 1 : 0)})
    })
    .catch(err => next(err));
}


exports.getAllProducts = (req, res, next) => {
    Product.find().then(result => {
        res.render('shop/product-list', {title : "Products", prods : result, path : '/products', auth: (req.session.user? 1: 0), verified: ((req.session.user && req.session.user.verified)? 1 : 0)})
    })
    .catch(err => next(err));
};

exports.getCart = (req, res, next) => {
    req.session.user.populate('cart.items.productId')
    .then(user => {
        res.render('shop/cart', {title : "Products", prods : user.cart.items, userId: req.session.user._id.toString(), path : '/cart', auth: (req.session.user? 1: 0), verified: ((req.session.user && req.session.user.verified)? 1 : 0)})
    }).catch(err => next(err));
}

exports.addToCart = (req, res, next) => {
    req.session.user.addItem(req.params.prodId)
    .then(() => res.redirect('/cart')).catch(err => next(err));
}

exports.removeFromCart = (req, res, next) => {
    req.session.user.removeItem(req.params.prodId).then(() => res.redirect('/cart')).catch(err => next(err));
}

exports.checkout = (req, res, next) => {
    let order;
    req.session.user.populate('cart.items.productId')
    .then(user => {
        order = new Order();
        let p = user.cart.items.map(value => value = {quantity: value.quantity, productId: {...value._doc.productId._doc}});
        order.products = [...p];
        order.userId = user._id;
        order.time = new Date();
        console.log(order.products);
        order.save().then(() => {
           req.session.user.clearCart().then(res.redirect('/orders'));
        });
    }).catch(err => next(err));
}

exports.getOrders = (req, res, next) => {
    Order.find({userId: req.session.user._id})
    .then(orders => res.render('shop/orders', {
        title: 'Orders', 
        orders: orders, 
        path: '/orders', 
        auth: (req.session.user? 1: 0), 
        verified: ((req.session.user && req.session.user.verified)? 1 : 0)
    })).catch(err => next(err));;
}

exports.getInvoice = (req, res, next) => {
    Order.findById(req.params.orderId)
    .then(order => {
        if(!order) {
            return res.redirect('/orders');
        }
        let invoice = new pdfDocument({font: 'Times-Italic'});
        let invoicePath = path.join('Data', 'invoice', `invoice-${order._id}`, '.pdf');
        invoice.pipe(fs.createWriteStream(invoicePath));
        invoice.pipe(res);
        
        invoice.fontSize(20).text('Invoice\n---------------------------------------');
        invoice.fontSize(14).text('product    quantity    price');
        order.products.forEach(p => {
            invoice.fontSize(14).text(`${p.name}    ${p.quantity}    ${p.price}`);
        });
        invoice.end();
        res.setHeaders('Content-Type', 'application/pdf');
        res.setHeaders('Content-Disposition', `inline; filename="invoice-${order._id}.pdf"`);
        res.send();
    }).catch(err => next(err));
}
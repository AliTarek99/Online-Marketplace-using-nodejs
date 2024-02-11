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
        let invoicePath = path.join('Data', 'invoices', `invoice-${order._id}.pdf`);
        let fileStream = fs.createWriteStream(invoicePath);

        // Pipe the PDF to the file stream to save it to a file
        invoice.pipe(fileStream);

        // Set up content for the PDF
        invoice.fontSize(20).text('Invoice\n---------------------------------------');
        invoice.fontSize(14).text('product          quantity            price');
        let total = 0;
        order.products.forEach(p => {
            invoice.fontSize(14).text(`${p.productId.title}         ${p.quantity}           ${p.productId.price}`, {
                columns: 3,
                columnGap: 15,
                height: 100,
                width: 465,
                align: 'justify'
            });
            total += p.quantity * p.productId.price;
        });
        invoice.fontSize(20).text('---------------------------------------');
        invoice.fontSize(14).text(`Total: ${total}$`);
        // Close the PDF
        invoice.end();

        // Set Content-Disposition header to indicate inline display and provide filename
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="invoice-${order._id}.pdf"`);

        // Pipe the PDF to the response stream to send it to the client
        invoice.pipe(res);
    }).catch(err => next(err));
}
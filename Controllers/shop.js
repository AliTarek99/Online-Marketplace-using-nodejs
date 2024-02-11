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
        res.render('shop/cart', {title : "Products", prods : user.cart.items, err: null, userId: req.session.user._id.toString(), path : '/cart', auth: (req.session.user? 1: 0), verified: ((req.session.user && req.session.user.verified)? 1 : 0)})
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
        order.save().then(order => {
            generateInvoice(user.cart.items, order._id.toString());
            order.invoice = path.join('Data', 'invoices', `invoice-${order._id}.pdf`);
            user.clearCart();
            return order.save();
        }).then(order => res.redirect('/orders'));
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

const generateInvoice = (items, id) => {
    let invoice = new pdfDocument({font: 'Times-Italic'});
    let invoicePath = path.join('Data', 'invoices', `invoice-${id}.pdf`);
    let fileStream = fs.createWriteStream(invoicePath);

    // Pipe the PDF to the file stream to save it to a file
    invoice.pipe(fileStream);

    // Set up content for the PDF
    invoice.fontSize(20).text('Invoice\n---------------------------------------');
    // invoice.fontSize(14).text('product          quantity            price');
    let total = 0;

    const table = {
        headers: ['Name', 'Quantity', 'Price'],
        rows: [],
        columnSpacing: 15,
        yStart: 120,
        cellPadding: 5,
        fontSize: 12
    };
    invoice.fontSize(table.fontSize);

    items.forEach(item => {
        table.rows.push([item.productId.title, item.quantity, item.productId.price])
        total += item.quantity * item.productId.price;
    });

    let currentY = table.yStart;

    // Draw headers
    table.headers.forEach((header, i) => {
        invoice.text(header, (i + 0.4) * 150 + table.columnSpacing, currentY);
    });

    currentY += table.fontSize + table.cellPadding;

    // Draw rows
    table.rows.forEach(row => {
        row.forEach((cell, i) => {
            invoice.text(cell, (i + 0.4) * 150 + table.columnSpacing, currentY);
        });
        currentY += table.fontSize + table.cellPadding;
    });

    invoice.fontSize(20).text('---------------------------------------', 70);
    invoice.fontSize(14).text(`Total: ${total}$`);
    // Close the PDF
    invoice.end();
}
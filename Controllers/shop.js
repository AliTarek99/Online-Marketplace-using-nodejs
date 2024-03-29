const Product = require('../Models/products');
const User = require('../Models/user');
const Order = require('../Models/order');
const path = require('path')
const fs = require('fs');
const pdfDocument = require('pdfkit');
const user = require('../Models/user');
const stripe = require('stripe')('sk_test_51OjEp7ElLr217bS3xeiYK7TkxmP9aDT8zsDZstypvDlo2pfT0mGzp20p35i8ODbATY9zeKzyQaIrTwzDzvLShRbh00yGsCMH1w');
const endpointSecret = "whsec_a672841fda5a932fdf0c4622e6bb92ac79232dfe1104a39d2d331af53a97cff2";

const MAX_PRODUCTS_PER_PAGE = 10;
const MAX_PRODUCTS_PER_HOMEPAGE = 3;

exports.getHome = (req, res, next) => {
    let currentPage = (+req.query.page || 1);
    Product.find().count()
    .then(count => {
        Product.find()
        .skip((currentPage - 1) * MAX_PRODUCTS_PER_HOMEPAGE)
        .limit(MAX_PRODUCTS_PER_HOMEPAGE)
        .sort({quantity: -1})
        .then(result => {
            res.render('shop/product-list', {
                title : "Products",
                prods : result,
                path : '/',
                lastPage: Math.ceil(count / MAX_PRODUCTS_PER_HOMEPAGE),
                currentPage: currentPage,
                auth: (req.session.user? 1: 0),
                verified: ((req.session.user && req.session.user.verified)? 1 : 0)
            });
        })
    })
    .catch(err => next(err));
}


exports.getAllProducts = (req, res, next) => {
    let currentPage = (+req.query.page || 1);
    Product.find().count()
    .then(count => {
        Product.find()
        .skip((currentPage - 1) * MAX_PRODUCTS_PER_PAGE)
        .limit(MAX_PRODUCTS_PER_PAGE)
        .sort({quantity: -1})
        .then(result => {
            res.render('shop/product-list', {
                title : "Products", 
                prods : result,
                path : '/products', 
                lastPage: Math.ceil(count / MAX_PRODUCTS_PER_PAGE),
                currentPage: currentPage,
                auth: (req.session.user? 1: 0), 
                verified: ((req.session.user && req.session.user.verified)? 1 : 0)
            });
        })
    })
    .catch(err => next(err));
}

exports.getCart = (req, res, next) => {
    let err = req.session.err;
    req.session.err = undefined;
    res.render('shop/cart', {
        title : "Cart",
        prods : req.session.user.cart.items, 
        err: err,
        path : '/cart', 
        auth: (req.session.user? 1: 0), 
        verified: ((req.session.user && req.session.user.verified)? 1 : 0)
    });
}

exports.addToCart = (req, res, next) => {
    Product.findById(req.params.prodId)
    .then(p => {
        if(p && p.quantity) {
            User.findOneAndUpdate({_id: req.session.user._id, isLocked: false}, {$set: {isLocked: true}}, {new: true}).then(user => {
                if(user) {
                    let msg = { err: "" };
                    return user.addItem(p, msg)
                    .then(modUser => {
                        modUser.isLocked = false;
                        return modUser.save();
                    })
                    .then(() => res.status(200).json({successful: (msg.err? false: true), message: msg.err}));
                }
                else 
                    res.status(500).json({successful: false, message: 'Processing previous request!'});
            })
            .catch(err => console.log(err));
        }
        else {
            return res.status(500).json({successful: false, message:'Product is out of stock.'});
        }
    }).catch(err => next(err));
}

exports.removeFromCart = (req, res, next) => {
    Product.findById(req.params.prodId)
    .then(p => {
        if(!p)
            return req.session.user.removeItem({_id: req.params.prodId}, req.session.user)
        return req.session.user.removeItem(p, req.session.user);
    })
    .then(p => {
        res.status(200).json({
            successful: true, 
            total: +req.body.total - p.quantity * p.price, 
            empty: p.empty
        });
    })
    .catch(err => console.log(err));
}

exports.checkoutCancelled = (req, res, next) => {
    req.session.err = 'Something went wrong!';
    res.redirect('/cart')
}

exports.getDetails =  (req, res, next) => {
    Product.findById(req.params.productId)
    .then(p => {
        if(!p) {
            return res.redirect('/shop');
        }
        return res.render('shop/product-detail', {
            title: p.title,
            path: '/details',
            product: p,
            auth: (req.session.user? 1: 0), 
            verified: ((req.session.user && req.session.user.verified)? 1 : 0)
        });
    }).catch(err => next(err));
}

exports.checkout = (req, res, next) => {
    let p = req.session.user.cart.items.map(value => value = value.product._id);
    let total = 0;
    Product.find({_id: {$in: p}}).then(products => {
        p = req.session.user.cart.items;
        let stock = true;
        req.session.user.cart.items.forEach((value, index) => {
            let x = products.findIndex(item => item._id.toString() == value.product._id.toString());
            if(x == -1) {
                req.session.err = 'Some products in the cart may have been removed or changed due to stock or product change. Refresh page to see changes.';
                value = null;
            }
            else {
                if(value.quantity > products[x].quantity) {
                    value.quantity = products[x].quantity;
                    stock &= (products[x].quantity != 0);
                    req.session.err = 'Some products in the cart may have been removed or changed due to stock or product change. Refresh page to see changes.';
                }
                value.product.price = products[x].price;
            }
        });
        req.session.user.cart.items = req.session.user.cart.items.filter(value => value != null && value.quantity != 0);
        return req.session.user.save();
    }).then(() => {
        return stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            shipping_address_collection: {
                allowed_countries: ['EG'],
            },
            phone_number_collection: {
                enabled: true
            },
            line_items: p.map(value => {
                total += value.product.price * 100 * value.quantity;
                return {
                    price_data: {
                        currency: 'usd',
                        unit_amount: value.product.price * 100,
                        product_data: {
                            name: value.product.title,
                            description: value.product.description,
                        },
                    },
                    quantity: value.quantity,
                }
            }),
            mode: 'payment',
            success_url: `${req.protocol}://${req.get('host')}/orders`,
            cancel_url: `${req.protocol}://${req.get('host')}/checkout/cancel`,
            metadata: {
                id: req.session.user._id.toString(),
                total: total
            }
        })
    }).then(session => {
        User.findByIdAndUpdate(req.session.user._id, {$set: {stripeId: session.id}})
        .then(() => {
            let err = req.session.err;
            req.session.err = undefined;
            return res.status(200).json({sessionId: session.id, err: err});
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

exports.stripeWebHooks = (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            let u;
            const paymentIntent = event.data.object;
            User.findById(paymentIntent.metadata.id)
            .then(user => {
                u = user;
                return makeOrder(user, paymentIntent.shipping_details, paymentIntent.customer_details);
            })
            .then(result => {
                if(result)
                    res.status(200).send();
                else {
                    return stripe.refunds.create({
                        payment_intent: paymentIntent.id,
                        amount: paymentIntent.metadata.total
                    });
                }
            })
            .catch(err => console.log(err));
            break;
        case 'payment_intent.canceled':
            paymentIntent = event.data.object;
            Order.findOneAndDelete({userId: paymentIntent.metadata.id}, {sort: { time: -1 }})
            .then(() => res.status(200).send())
            .catch(err => console.log(err));
            break;
        default:
            res.status(200).send();
    }
}

const generateInvoice = (user, order) => {
    let items = user.cart.items;
    let invoice = new pdfDocument({font: 'Times-Italic'});
    let invoicePath = path.join('Data', 'invoices', `invoice-${order._id}.pdf`);
    let fileStream = fs.createWriteStream(invoicePath);

    // Pipe the PDF to the file stream to save it to a file
    invoice.pipe(fileStream);
    invoice.font('Helvetica');
    // Set up content for the PDF
    invoice.fontSize(20).text('Invoice\n---------------------------------------');
    let total = 0;
    invoice.fontSize(20).text('Customer Info');
    invoice.fontSize(12).text(`Name: ${user.name}`);
    invoice.fontSize(12).text('City: ', {continued: true}).font('Data\\arabicFont.ttf').text(order.city);
    invoice.font('Helvetica');
    invoice.fontSize(12).text(`Address: ${order.address}`);
    invoice.fontSize(12).text(`Phone: ${order.phoneNumber}`);
    invoice.fontSize(20).text('---------------------------------------\nProducts');
    const table = {
        headers: ['Name', 'Quantity', 'Price'],
        rows: [],
        columnSpacing: 15,
        yStart: 270,
        cellPadding: 5,
        fontSize: 12
    };
    invoice.fontSize(table.fontSize);

    items.forEach(item => {
        table.rows.push([item.product.title, item.quantity, item.product.price])
        total += item.quantity * item.product.price;
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

const makeOrder = (u, shippingInfo, customerInfo) => {
    let order = new Order();
    if(u.cart.items.length) {
        return User.findOneAndUpdate({_id: u._id, isLocked: false}, {$set: {isLocked: true}}, {new: true})
        .then(user => {
            if(!user) return false;
            let p = user.cart.items.map(value => value = value.product._id);
            return Product.find({_id: {$in: p}})
            .then(products => {
                let stock = true;
                user.cart.items.forEach((value, index) => {
                    let x = products.findIndex(prod => prod._id.toString() == value.product._id.toString());
                    if(x == -1) {
                        value = null;
                        stock = false;
                    }
                    else if(value.quantity > products[x].quantity) {
                        value.quantity = products[x].quantity;
                        stock = false;
                    }
                });
                if(stock) {
                    order.address = shippingInfo.address.line1 + (shippingInfo.address.line2? ` ${shippingInfo.address.line2}`: "");
                    order.city = shippingInfo.address.state;
                    order.phoneNumber = customerInfo.phone;
                    order.products = [...(user.cart.items)];
                    order.userId = user._id;
                    order.time = new Date();
                    user.cart.items.forEach(product => {
                        Product.findById(product.product._id)
                        .then(p => {
                            p.quantity -= product.quantity;
                            p.save();
                        });
                    });
                    return order.save()
                    .then(order => {
                        order.invoice = path.join('Data', 'invoices', `invoice-${order._id}.pdf`);
                        order.save();
                        generateInvoice(user, order);
                        user.isLocked = false;
                        return user.clearCart().then(() => true);
                    });
                }
                else {
                    user.cart.items = user.cart.items.filter(value => value != null && value.quantity != 0);
                }
                user.isLocked = false;
                return user.save().then(() => false);
            })
        }).catch(err => console.log(err));
        
    }
    else return false;
}
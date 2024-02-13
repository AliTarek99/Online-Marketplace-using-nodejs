const express = require('express');

const productController = require('../Controllers/shop');

const route = express.Router();

route.get('/products', productController.getAllProducts);

route.get('/', productController.getHome);

route.get('/cart', productController.getCart);

route.get('/checkout', productController.getCheckout);

route.get('/checkout/success', productController.checkoutSuccess);

route.get('/checkout/cancel', productController.checkoutCancelled);

route.get('/orders', productController.getOrders);

// route.get('/orders/:orderId', productController.getInvoice);

route.post('/add-to-cart/:prodId', productController.addToCart);

route.post('/remove-from-cart/:prodId', productController.removeFromCart);

module.exports = route;
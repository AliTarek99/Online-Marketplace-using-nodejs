const express = require('express');

const shopController = require('../Controllers/shop');

const route = express.Router();

route.get('/products', shopController.getAllProducts);

route.get('/', shopController.getHome);

route.get('/cart', shopController.getCart);

route.get('/details/:productId', shopController.getDetails);

route.get('/checkout', shopController.checkout);

route.get('/checkout/cancel', shopController.checkoutCancelled);

route.get('/orders', shopController.getOrders);

// route.get('/orders/:orderId', productController.getInvoice);

route.post('/webhook', express.raw({type: 'application/json'}), shopController.stripeWebHooks);

route.patch('/add-to-cart/:prodId', shopController.addToCart);

route.patch('/remove-from-cart/:prodId', shopController.removeFromCart);

module.exports = route;
const express = require('express');

const adminController = require('../Controllers/admin');

const route = express.Router();


route.get('/add-product/', adminController.getAddProduct);

route.post('/add-product/', adminController.postEdit);

route.post('/add-product/:prodId', adminController.postEdit);

route.get('/products', adminController.getProducts);

route.post('/delete-product/:prodId', adminController.deleteProduct);

route.get('/edit-product/:prodId', adminController.getEdit);

module.exports = route;
const express = require('express');
const { check } = require('express-validator');
const adminController = require('../Controllers/admin');

const route = express.Router();


route.get('/add-product/', adminController.getAddProduct);

route.post('/add-product/', 
    [
        check('quantity').isInt().withMessage('quantity must be a number'),
        check('price').isFloat().withMessage('Price must be decimal number')
    ], 
    adminController.postEdit
);

route.post('/add-product/:prodId', 
    [
        check('quantity').isInt().withMessage('quantity must be a number'),
        check('price').isFloat().withMessage('Price must be decimal number')
    ], 
    adminController.postEdit
);

route.get('/products', adminController.getProducts);

route.delete('/delete-product/:prodId', adminController.deleteProduct);

route.get('/edit-product/:prodId', adminController.getEdit);

module.exports = route;
const mongoose = require('mongoose');
const { INTEGER } = require('sequelize');

const Schema = mongoose.Schema

const Users = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: {type: String},
    tokenExpiry: {type: Date},
    cart: {
        items: [{
            product: {type: Object, required: true},
            quantity: {type: Schema.Types.Number, required: true}
        }]
    },
    verified: {
        type: Boolean,
        required: true
    },
    isLocked: {
        type: Boolean,
        deafault: false
    }
});

Users.methods.removeItem = function(product) {
    let quantity = 0, price = 0;
    this.cart.items = this.cart.items.filter(value => {
        if(value.product._id.toString() == product._id.toString()) {
            quantity += value.quantity;
            price = value.product.price;
        }
        return value.product._id.toString() != product._id.toString()
    });
    return this.save().then(() => {
        return {
            quantity: quantity, 
            price: price, 
            empty: this.cart.items.length == 0
        }
    });
}

Users.methods.addItem = function(product) {
    let x = this.cart.items.findIndex(value => value.product._id.toString() == product._id.toString());
    if(x != -1) {
        this.cart.items[x].quantity++;
    }
    else 
        this.cart.items.push({product: product, quantity: 1});
    return this.save().then(function(){ this.mutex = 1; });
}

Users.methods.clearCart = function() {
    this.cart = {items: []};
    return this.save();
}

module.exports = mongoose.model('Users', Users);

// const db = require('../util/database').getdb;
// const mongodb = require('mongodb');

// class user{
//     constructor(name, email, cart, id) {
//         this.name = name;
//         this.email = email;
//         this.cart = cart;
//         this._id = new mongodb.ObjectId(id);
//     }

//     save() {
//         return db().collection('user').insertOne(this); 
//     }

//     getCart() {
//         return db().collection('products').find({_id: {$in: this.cart.map(value => value = value.id)}}).toArray()
//         .then(products => {
//             products.forEach(p => {
//                 p.quantity = this.cart.find(value => value.id.toString() == p._id.toString()).quantity;
//             });
//             return products;
//         });
//     }

//     removeItem(productId) {
//         this.cart = this.cart.filter(values => values.id != productId)
//         return db().collection('user').updateOne({_id: this._id}, {$set: {cart: this.cart}});
//     }

//     addItem(productId) {
//         if(this.cart.filter(value => value.id == productId).length) {
//             this.cart = this.cart.map(value => {
//                 if(value.id == productId) return {id : value.id, quantity: value.quantity + 1}
//                 return value;
//             })
//         }
//         else
//             this.cart.push({id: new mongodb.ObjectId(productId), quantity: 1});
//         return db().collection('user').updateOne({_id: this._id}, {$set: {cart: this.cart}});
//     }

//     clearCart() {
//         this.cart = [];
//         return db().collection('user').updateOne({_id: this._id}, {$set: {cart: this.cart}});
//     }

//     static getById(id) {
//         return db().collection('user').findOne({ _id : new mongodb.ObjectId(id)});
//     }
// }

// module.exports = user;
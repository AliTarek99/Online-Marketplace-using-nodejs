const mongoose = require('mongoose');

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
    cart: {
        items: [{
            productId: {type: Schema.Types.ObjectId, ref: 'Products', required: true},
            quantity: {type: Schema.Types.Number, required: true}
        }]
    },
    verified: {
        type: Boolean,
        required: true
    }
});

Users.methods.removeItem = function(prodId) {
    this.cart.items = this.cart.items.filter(values => values.productId != prodId);
    return this.save();
}

Users.methods.addItem = function(prodId) {
    let x = this.cart.items.findIndex(value => value.productId == prodId);
    if(x != -1) {
        this.cart.items[x].quantity++;
    }
    else 
        this.cart.items.push({productId: prodId, quantity: 1});
    return this.save();
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
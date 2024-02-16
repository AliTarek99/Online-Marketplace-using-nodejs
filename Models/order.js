const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Orders = new Schema({
    products: [Object],
    time: Schema.Types.Date,
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    invoice: {
        type: String,
    },
    city: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Orders', Orders);

// const db = require('../util/database').getdb;

// class order {
//     constructor(cart, time, userId) {
//         this.cart = cart;
//         this.time = time;
//         this.userId = userId;
//     }

//     save() {
//         return db().collection('orders').insertOne(this);
//     }

//     static getOrders(userId) {
//         return db().collection('orders').find({userId: userId}).toArray();
//     }
// }

// module.exports = order;
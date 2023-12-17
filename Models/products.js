const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const Product = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Schema.Types.Decimal128,
        required: true
    },
    quantity: {
        type: Schema.Types.Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imgUrl: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Users'
    }

});

module.exports = mongoose.model('Products', Product);

// const db = require('../util/database');

// const mongodb = require('mongodb');

// module.exports = class Product{
//     constructor(title, price, quantity, description, imgUrl, _id) {
//         this.title = title;
//         this.price = price;
//         this.quantity = quantity;
//         this.description = description;
//         this.imgUrl = imgUrl;
//         this._id = _id;
//     }

//     save() {
//         if(this._id) {
//             this._id = new mongodb.ObjectId(this._id);
//             return db.getdb().collection('products').updateOne({_id: this._id}, {$set: this});
//         }
//         else
//             return db.getdb().collection('products').insertOne(this).then(result => console.log(result));
//     }

//     static fetchAll() {
//         return db.getdb().collection('products').find().toArray();
//     }
    
//     static getOne(id) {
//         return db.getdb().collection('products').find({_id: new mongodb.ObjectId(id)}).next();
//     }

//     static delete(id) {
//         return db.getdb().collection('products').deleteOne({_id: new mongodb.ObjectId(id)});
//     }
// }

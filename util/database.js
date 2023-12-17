const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
// const Sequelize = require('sequelize');

// const s = new Sequelize('nodejs', 'root', '0000', {dialect: 'mysql', host: 'localhost'});

// module.exports = s;
// let _db;

// exports.connect = cb => {
//     mongoClient.connect('mongodb+srv://alitarek:0000@cluster0.yt1qvle.mongodb.net/?retryWrites=true&w=majority')
//     .then(client => {
//         console.log('4444444');
//         _db = client.db();
//         cb();
//     })
//     .catch( err => {
//         console.log(err);
//     });
// }

// exports.getdb = () => {
//     if(_db) return _db;
//     else {
//         return this.connect(() => _db);
//     }
// }
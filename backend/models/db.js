const mongoose = require('mongoose');

const db = {};


db.ConnectDB = () => {
    mongoose.connect(process.env.URL, { dbName: process.env.DBNAME })
        .then(console.log("Connect to MongoDB"))
        .catch(error => {
            console.log("Connect fail:" + error);
        });
}

module.exports = { db };
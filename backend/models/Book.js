const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    genre: String,
    description: String,
    language: String,
    translator: String,
    publisher: String,
    publishDate: Date,
    price: Number,
    originalPrice: Number,
    stock: Number,
    isActivated: Boolean,
    isNewRelease: Boolean,
    images: [String],
    categories:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
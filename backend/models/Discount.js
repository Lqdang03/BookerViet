    const mongoose = require('mongoose');

    const discountSchema = new mongoose.Schema({
        code: {
            type: String,
            required: true,
            unique: true
        },
        type: {
            type: String,
            required: true,
            enum: ['fixed', 'percentage']
        },
        value: {
            type: Number,
            required: true
        },
        minPurchase: {
            type: Number,
            required: true
        },
        usageLimit: {
            type: Number,
            required: true
        },
        usedCount: {
            type: Number,
            default: 0
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        }
    }, { timestamps: true });

    module.exports = mongoose.model('Discount', discountSchema);
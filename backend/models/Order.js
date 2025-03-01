const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            book: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Book',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            }
        }
    ],
    totalDiscount: {
        type: Number,
        default: 0,
        min: 0
    },
    pointUsed: {
        type: Number,
        default: 0,
        min: 0
    },
    paymentMethod: {
        type: String,
        enum: ['COD', 'Online'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Pending'
    },
    orderStatus: {
        type: String,
        enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Processing'
    },
    shippingAddress: {
        name: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
    },
    trackingNumber: {
        type: String,
        default: null
    },
    expectedDeliveryDate: {
        type: Date,
        default: null
    },
    notes: {
        type: String,
        default: ''
    }

}, {timestamps: true});

orderSchema.index(
    { trackingNumber: 1 },
    { unique: true, partialFilterExpression: { trackingNumber: { $ne: null } } }
);

module.exports = mongoose.model('Order', orderSchema);
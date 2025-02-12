const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: String,
  phone: String,
  address: String,
  point: Number,
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
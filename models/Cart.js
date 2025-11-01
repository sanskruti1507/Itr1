// models/Cart.js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  name: String,
  description: String,
  imageUrl: String,
  selectedOption: String,
  price: mongoose.Schema.Types.Decimal128, // Use Decimal128 for precise monetary values
  quantity: Number
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [cartItemSchema]
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
// This is an example of what your Order schema should look like.
const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
    name: String,
    description: String,
    imageUrl: String,
    selectedOption: String,
    price: Number,
    quantity: Number
});

const AddressSchema = new mongoose.Schema({
    fullName: String,
    phoneNumber: String,
    pincode: String,
    addressLine1: String,
    addressLine2: String,
    landmark: String,
    city: String,
    state: String
});

const OrderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [OrderItemSchema], // Matches the `cartItems` array
    address: AddressSchema,   // Matches the `address` object
    paymentMethod: {
        type: String,
        required: true
    },
    paymentDetails: {         // Matches the `paymentDetails` object
        cardNumberMasked: String,
        upiId: String,
        bankName: String
    },
    totalAmount: {
        type: Number,
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', OrderSchema);
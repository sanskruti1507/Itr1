const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  gender: { type: String },
  dob: { type: String } // or type: Date if desired
});

module.exports = mongoose.model('User', userSchema);

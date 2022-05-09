const main = require('../config/db/connection').main;
const { default: mongoose } = require('mongoose');


const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  products: [{ _id: false , productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Laptop', required: true }, quantity: { type: Number, required: true } }]
}, { timestamps: true  })

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const TransactionSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  datetime: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    required: true,
  },
  expireAt: {
    type: Date,
    expires: 2592000,
    index: true,
    default: Date.now
  }

  //createdAt: { type: Date, default: Date.now, expires: '1s', index: { expireAfterSeconds: 0 } }

}, { timestamps: true });



module.exports = model("Transaction", TransactionSchema);;


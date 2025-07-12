const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    quantity: {
      type: Number,
      required: [true, 'Item quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    category: {
      type: String,
      enum: ['lab', 'electronics', 'books', 'general'],
      default: 'general',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Item', itemSchema);

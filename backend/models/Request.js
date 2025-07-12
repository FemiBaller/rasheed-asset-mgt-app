// backend/models/Request.js
const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Item', 'ExclusiveDocument'],
      required: true,
    },
    // Dynamically points at either the Item or ExclusiveDocument model
    itemOrDocument: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'type',
    },
    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'declined', 'issued', 'returned'],
      default: 'pending',
    },
    quantityRequested: {
      type: Number,
      default: 1,
    },
    duration: {
      type: String,
      enum: ['1 day', '2 days', '3 days', '4 days', '5 days', '1 week'],
      required: () => true,
    },
    quantityIssued: {
      type: Number,
      default: 0,
    },
    issuedByStoreKeeper: {
      type: Boolean,
      default: false,
    },
    returnStatus: {
      type: String,
      enum: ['not_returned', 'returned'],
      default: 'not_returned',
    },
    // In your models/request.js (or wherever your Request model is)
declineReason: {
  type: String,
  required: false
}
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Request', requestSchema);


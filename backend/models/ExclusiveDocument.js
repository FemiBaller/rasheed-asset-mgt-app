const mongoose = require('mongoose');

const exclusiveDocumentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  fileUrl: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.models.ExclusiveDocument || mongoose.model('ExclusiveDocument', exclusiveDocumentSchema);

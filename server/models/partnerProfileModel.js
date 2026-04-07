const mongoose = require('mongoose');

const partnerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    displayName: {
      type: String,
      trim: true,
      default: '',
    },
    dateOfBirth: { type: Date, required: true },
    birthTime: { type: String, required: true, trim: true },
    birthPlace: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

partnerProfileSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('PartnerProfile', partnerProfileSchema);

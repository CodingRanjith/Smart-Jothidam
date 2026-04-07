const mongoose = require('mongoose');

// Module 3: cached single-person Josiyam API responses (chart + 20 categories + summary)
const josiyamResultSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, required: true, default: 'single', index: true },
    inputHash: { type: String, required: true, index: true },
    calculationVersion: { type: String, required: true, index: true },

    language: { type: String, default: 'ta-IN' },
    input: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    chart: { type: mongoose.Schema.Types.Mixed, default: {} },
    categories: { type: [mongoose.Schema.Types.Mixed], default: [] },
    summary: { type: mongoose.Schema.Types.Mixed, default: {} },

    // Full deterministic trace (optional; useful for debugging / future features)
    deterministic: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

josiyamResultSchema.index(
  { userId: 1, type: 1, inputHash: 1, calculationVersion: 1 },
  { unique: true }
);

// List/filter by user + kind (prefix of the unique compound also serves this; explicit index for clarity)
josiyamResultSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('JosiyamResult', josiyamResultSchema);

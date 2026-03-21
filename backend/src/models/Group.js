const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    displayName: {
      type: String,
      required: true,
      trim: true
    },
    normalizedKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    sheetName: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

groupSchema.index({ displayName: 1 });

module.exports = mongoose.model('Group', groupSchema);

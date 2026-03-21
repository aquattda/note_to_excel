const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
      index: true
    },
    originalContent: {
      type: String,
      required: true,
      trim: true
    },
    normalizedKeySnapshot: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    annotation: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

noteSchema.index({ groupId: 1, createdAt: 1 });
noteSchema.index({ normalizedKeySnapshot: 1, createdAt: 1 });

module.exports = mongoose.model('Note', noteSchema);

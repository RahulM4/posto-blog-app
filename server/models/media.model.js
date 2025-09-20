const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

MediaSchema.index({ uploadedBy: 1 });
MediaSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Media', MediaSchema);

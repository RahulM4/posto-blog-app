const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    token: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    createdByIp: {
      type: String
    },
    revokedAt: {
      type: Date
    },
    replacedByToken: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

RefreshTokenSchema.index({ userId: 1, expiresAt: -1 });
RefreshTokenSchema.index({ token: 1 }, { unique: true });

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);

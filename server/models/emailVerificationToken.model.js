const mongoose = require('mongoose');

const EmailVerificationTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    token: {
      type: String,
      required: true,
      unique: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    usedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

EmailVerificationTokenSchema.index({ userId: 1 });
EmailVerificationTokenSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('EmailVerificationToken', EmailVerificationTokenSchema);

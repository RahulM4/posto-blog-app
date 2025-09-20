const mongoose = require('mongoose');

const PasswordResetTokenSchema = new mongoose.Schema(
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

PasswordResetTokenSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('PasswordResetToken', PasswordResetTokenSchema);

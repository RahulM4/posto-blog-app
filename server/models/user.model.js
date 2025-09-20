const mongoose = require('mongoose');
const validator = require('validator');
const { ROLES } = require('../config/rbac');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Invalid email address']
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'active'
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: {
      type: Date
    },
    emailVerifiedAt: {
      type: Date
    },
    avatarUrl: {
      type: String
    },
    lastLoginAt: {
      type: Date
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      }
    }
  },
  
  
);

UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ approvalStatus: 1 });
UserSchema.index({ emailVerifiedAt: 1 });
UserSchema.index({ deletedAt: 1 });

module.exports = mongoose.model('User', UserSchema);

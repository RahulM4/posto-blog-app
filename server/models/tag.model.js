const mongoose = require('mongoose');
const slugify = require('slugify');

const TagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      lowercase: true
    },
    type: {
      type: String,
      enum: ['product', 'post'],
      required: true
    }
  },
  {
    timestamps: true
  }
);

TagSchema.index({ slug: 1, type: 1 }, { unique: true });

TagSchema.pre('validate', function preValidate(next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Tag', TagSchema);

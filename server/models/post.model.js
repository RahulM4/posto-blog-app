const mongoose = require('mongoose');
const slugify = require('slugify');

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    content: {
      type: String,
      default: ''
    },
    coverImage: {
      url: String,
      mediaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media'
      }
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    tagIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag'
      }
    ],
    status: {
      type: String,
      enum: ['draft', 'review', 'published'],
      default: 'draft'
    },
    scheduledAt: {
      type: Date
    },
    publishedAt: {
      type: Date
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    guestAuthor: {
      name: {
        type: String,
        trim: true
      },
      email: {
        type: String,
        trim: true,
        lowercase: true
      }
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

PostSchema.index({ status: 1, scheduledAt: 1 });
PostSchema.index({ title: 'text', content: 'text' });
PostSchema.index({ deletedAt: 1 });

PostSchema.pre('validate', function preValidate(next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Post', PostSchema);

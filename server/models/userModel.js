const mongoose = require('mongoose');

// Module 1: phone + password auth (JWT issued by backend)
const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // never return password hashes
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mobileVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    dob: {
      type: Date,
      default: null,
    },
    birthTime: {
      type: String,
      default: null,
    },
    birthPlace: {
      type: String,
      default: null,
      trim: true,
    },
    resetTokenHash: {
      type: String,
      default: null,
      select: false,
    },
    resetTokenExpires: {
      type: Date,
      default: null,
    },
    isPremium: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true, // createdAt + updatedAt
  }
);

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    // defensive: passwordHash is select:false but keep this anyway
    delete ret.passwordHash;
    delete ret.resetTokenHash;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;

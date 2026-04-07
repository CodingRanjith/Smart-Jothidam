const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel');
const connectDB = require('../config/db');

function errorText(err, depth = 0) {
  if (!err || depth > 6) return '';
  return [
    String(err.message || ''),
    String(err.errmsg || ''),
    String(err.errorResponse?.errmsg || ''),
    errorText(err.cause, depth + 1),
  ].join(' ');
}

function isObsoleteUidIndexDuplicateError(err) {
  const uidField = connectDB.OBSOLETE_UID_FIELD;
  const blob = errorText(err);
  const dup =
    err?.code === 11000 ||
    err?.cause?.code === 11000 ||
    /E11000|duplicate key error/i.test(blob);
  if (!dup) return false;
  const re = new RegExp(uidField, 'i');
  return (
    re.test(blob) ||
    err?.keyPattern?.[uidField] != null ||
    (err?.keyValue &&
      Object.prototype.hasOwnProperty.call(err.keyValue, uidField))
  );
}

const signToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      phone: user.phone,
      mobileVerified: user.mobileVerified,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Register (upsert by phone): hash password + mark mobileVerified=true (for Module 1)
 */
const registerUser = async ({ phone, password, name, dob, birthTime, birthPlace }) => {
  const passwordHash = await bcrypt.hash(password, 10);

  const update = {
    phone,
    passwordHash,
    name,
    mobileVerified: true, // Module 1: treat as verified in current implementation
    dob: dob ?? undefined,
    birthTime: birthTime ?? undefined,
    birthPlace: birthPlace ?? undefined,
  };

  const upsert = () =>
    User.findOneAndUpdate({ phone }, update, {
      new: true,
      upsert: true,
      runValidators: true,
    });

  try {
    const user = await upsert();
    return { user, token: signToken(user) };
  } catch (err) {
    if (!isObsoleteUidIndexDuplicateError(err)) throw err;
    console.error(
      'registerUser: E11000 on obsolete uid index; dropping indexes and retrying once'
    );
    await connectDB.dropObsoleteUidIndexes();
    const user = await upsert();
    return { user, token: signToken(user) };
  }
};

/**
 * Login with phone + password, return { token, user }
 */
const loginUser = async ({ phone, password }) => {
  const user = await User.findOne({ phone }).select('+passwordHash');
  if (!user) {
    const err = new Error('Invalid phone or password');
    err.statusCode = 401;
    throw err;
  }

  const passwordOk = await bcrypt.compare(password, user.passwordHash);
  if (!passwordOk) {
    const err = new Error('Invalid phone or password');
    err.statusCode = 401;
    throw err;
  }

  const token = signToken(user);

  return { token, user };
};

/**
 * Verify token / fetch current user by id
 */
const getUserById = async (userId) => {
  const user = await User.findById(userId);
  return user;
};

/**
 * Get profile by user id
 */
const getProfile = async (userId) => {
  const user = await getUserById(userId);
  return user;
};

/**
 * Update allowed profile fields
 */
const updateUserProfile = async (userId, updateData) => {
  const allowedUpdates = ['name', 'dob', 'birthTime', 'birthPlace', 'phone'];
  const filteredData = {};

  allowedUpdates.forEach((key) => {
    if (updateData[key] !== undefined) filteredData[key] = updateData[key];
  });

  // If phone changes, ensure uniqueness
  if (filteredData.phone) {
    const existing = await User.findOne({ phone: filteredData.phone, _id: { $ne: userId } });
    if (existing) {
      const err = new Error('Phone number already in use');
      err.statusCode = 409;
      throw err;
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: filteredData },
    { new: true, runValidators: true }
  );

  return updatedUser;
};

/**
 * Forgot password (Module 1 checklist)
 * Creates a reset token hash + expiry in DB.
 * NOTE: This demo does not actually send SMS/email.
 */
const forgotPassword = async ({ phone }) => {
  const user = await User.findOne({ phone });
  if (!user) {
    // Always respond generically to prevent account enumeration.
    return;
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  user.resetTokenHash = resetTokenHash;
  user.resetTokenExpires = resetTokenExpires;
  await user.save();

  return resetToken; // returned only for internal testing/debugging
};

/**
 * Reset password using reset token
 */
const resetPassword = async ({ token, newPassword }) => {
  const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetTokenHash,
    resetTokenExpires: { $gt: new Date() },
  });

  if (!user) {
    const err = new Error('Invalid or expired reset token');
    err.statusCode = 400;
    throw err;
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.resetTokenHash = null;
  user.resetTokenExpires = null;
  await user.save();

  return user;
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
};

const User = require('../models/userModel');

/**
 * When PREMIUM_GATE_ENABLED=true, PDF export and similar actions require user.isPremium.
 * When unset or not "true", premium checks are skipped.
 */
async function requirePremiumForExport(userId) {
  if (process.env.PREMIUM_GATE_ENABLED !== 'true') {
    return;
  }
  const user = await User.findById(userId).select('isPremium');
  if (!user || !user.isPremium) {
    const err = new Error('Not premium');
    err.statusCode = 403;
    throw err;
  }
}

module.exports = {
  requirePremiumForExport,
};

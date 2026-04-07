const mongoose = require('mongoose');
const PartnerProfile = require('../models/partnerProfileModel');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_HHMM_RE = /^([01][0-9]|2[0-3]):([0-5][0-9])$/;

function parseIsoDateOnly(value) {
  if (!value || typeof value !== 'string') return null;
  const s = value.trim();
  if (!ISO_DATE_RE.test(s)) return null;
  const [y, m, d] = s.split('-').map((x) => Number(x));
  if (!y || !m || !d) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

/**
 * GET /api/partners
 * List saved partner birth profiles for the authenticated user.
 */
async function list(req, res) {
  const userId = req.user?.userId;
  if (!userId) {
    return errorResponse(res, 'Unauthorized', 401);
  }

  try {
    const uid = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;
    const rows = await PartnerProfile.find({ userId: uid })
      .sort({ createdAt: -1 })
      .lean();

    const data = rows.map((r) => ({
      id: String(r._id),
      displayName: r.displayName || '',
      dateOfBirth: r.dateOfBirth
        ? new Date(r.dateOfBirth).toISOString().split('T')[0]
        : '',
      birthTime: r.birthTime,
      birthPlace: r.birthPlace,
    }));

    return successResponse(res, 'Partner profiles loaded', { partners: data }, 200);
  } catch (err) {
    console.error('Partner list error:', err);
    return errorResponse(res, err?.message || 'Failed to list partners', 500);
  }
}

function validateCreateBody(body) {
  const errors = [];
  if (body == null || typeof body !== 'object') {
    return [{ field: 'body', message: 'JSON body is required' }];
  }
  const { dateOfBirth, birthTime, birthPlace } = body;
  if (!dateOfBirth) {
    errors.push({ field: 'dateOfBirth', message: 'Required' });
  } else if (!parseIsoDateOnly(String(dateOfBirth))) {
    errors.push({
      field: 'dateOfBirth',
      message: 'Must be a valid ISO date (YYYY-MM-DD)',
    });
  }
  if (!birthTime || !String(birthTime).trim()) {
    errors.push({ field: 'birthTime', message: 'Required' });
  } else if (!TIME_HHMM_RE.test(String(birthTime).trim())) {
    errors.push({ field: 'birthTime', message: 'Must be in HH:mm format' });
  }
  if (!birthPlace || !String(birthPlace).trim()) {
    errors.push({ field: 'birthPlace', message: 'Required' });
  }
  return errors;
}

/**
 * POST /api/partners
 * Create a partner birth profile for the authenticated user.
 */
async function create(req, res) {
  const userId = req.user?.userId;
  if (!userId) {
    return errorResponse(res, 'Unauthorized', 401);
  }

  const validationErrors = validateCreateBody(req.body);
  if (validationErrors.length > 0) {
    return errorResponse(res, 'Validation errors', 400, validationErrors);
  }

  const { displayName, dateOfBirth, birthTime, birthPlace } = req.body;
  const uid = mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : userId;

  try {
    const doc = await PartnerProfile.create({
      userId: uid,
      displayName: displayName != null ? String(displayName).trim() : '',
      dateOfBirth: parseIsoDateOnly(String(dateOfBirth)),
      birthTime: String(birthTime).trim(),
      birthPlace: String(birthPlace).trim(),
    });

    return successResponse(
      res,
      'Partner profile created',
      {
        partner: {
          id: String(doc._id),
          displayName: doc.displayName || '',
          dateOfBirth: doc.dateOfBirth.toISOString().split('T')[0],
          birthTime: doc.birthTime,
          birthPlace: doc.birthPlace,
        },
      },
      201
    );
  } catch (err) {
    console.error('Partner create error:', err);
    return errorResponse(res, err?.message || 'Failed to create partner', 500);
  }
}

module.exports = {
  list,
  create,
};

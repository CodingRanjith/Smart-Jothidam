const mongoose = require('mongoose');
const User = require('../models/userModel');
const PartnerProfile = require('../models/partnerProfileModel');
const JosiyamResult = require('../models/josiyamResultModel');
const JosiyamService = require('../services/josiyam/josiyamService');
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

function validateSingleBody(body) {
  const errors = [];

  if (body == null || typeof body !== 'object') {
    return [{ field: 'body', message: 'JSON body is required' }];
  }

  const { useProfile, dateOfBirth, birthTime, birthPlace, language } = body;

  if (useProfile === undefined || useProfile === null) {
    errors.push({ field: 'useProfile', message: 'Required' });
    return errors;
  }

  if (typeof useProfile !== 'boolean') {
    errors.push({ field: 'useProfile', message: 'Must be a boolean' });
    return errors;
  }

  if (useProfile === false) {
    if (!dateOfBirth) {
      errors.push({
        field: 'dateOfBirth',
        message: 'Required',
      });
    } else if (!parseIsoDateOnly(String(dateOfBirth))) {
      errors.push({
        field: 'dateOfBirth',
        message: 'Must be a valid ISO date (YYYY-MM-DD)',
      });
    }
    if (!birthTime || !String(birthTime).trim()) {
      errors.push({
        field: 'birthTime',
        message: 'Required',
      });
    } else if (!TIME_HHMM_RE.test(String(birthTime).trim())) {
      errors.push({
        field: 'birthTime',
        message: 'Must be in HH:mm format',
      });
    }
    if (!birthPlace || !String(birthPlace).trim()) {
      errors.push({
        field: 'birthPlace',
        message: 'Required',
      });
    }
  }

  if (language !== undefined && language !== null && typeof language !== 'string') {
    errors.push({ field: 'language', message: 'Must be a string' });
  }

  return errors;
}

/**
 * Profile path (`useProfile === true`): map DB `dob` to API field name `dateOfBirth`.
 * Returns `{ field, message }[]` for 400 responses.
 */
function getProfileIncompleteErrors(user) {
  const errors = [];

  if (!user.dob) {
    errors.push({ field: 'dateOfBirth', message: 'Required in profile' });
  }

  const btRaw = user.birthTime;
  const bt = btRaw != null ? String(btRaw).trim() : '';
  if (!bt) {
    errors.push({ field: 'birthTime', message: 'Required in profile' });
  } else if (!TIME_HHMM_RE.test(bt)) {
    errors.push({
      field: 'birthTime',
      message: 'Must be valid HH:mm (24h) in profile',
    });
  }

  const bpRaw = user.birthPlace;
  const bp = bpRaw != null ? String(bpRaw).trim() : '';
  if (!bp) {
    errors.push({ field: 'birthPlace', message: 'Required in profile' });
  }

  return errors;
}

function validateCoupleBody(body) {
  const errors = [];

  if (body == null || typeof body !== 'object') {
    return [{ field: 'body', message: 'JSON body is required' }];
  }

  const { useProfiles, partnerA, partnerB, language } = body;

  if (useProfiles === undefined || useProfiles === null) {
    errors.push({ field: 'useProfiles', message: 'Required' });
  } else if (typeof useProfiles !== 'boolean') {
    errors.push({ field: 'useProfiles', message: 'Must be a boolean' });
  }

  if (language !== undefined && language !== null && typeof language !== 'string') {
    errors.push({ field: 'language', message: 'Must be a string' });
  }

  if (errors.length > 0) return errors;

  const pa = partnerA && typeof partnerA === 'object' ? partnerA : null;
  const pb = partnerB && typeof partnerB === 'object' ? partnerB : null;

  if (!pa) {
    errors.push({ field: 'partnerA', message: 'Required' });
  }
  if (!pb) {
    errors.push({ field: 'partnerB', message: 'Required' });
  }
  if (errors.length > 0) return errors;

  if (body.useProfiles === true) {
    if (!pa.profileId || !String(pa.profileId).trim()) {
      errors.push({
        field: 'partnerA.profileId',
        message: 'Required when useProfiles is true',
      });
    } else if (!mongoose.Types.ObjectId.isValid(String(pa.profileId))) {
      errors.push({
        field: 'partnerA.profileId',
        message: 'Must be a valid profile id',
      });
    }
    if (!pb.profileId || !String(pb.profileId).trim()) {
      errors.push({
        field: 'partnerB.profileId',
        message: 'Required when useProfiles is true',
      });
    } else if (!mongoose.Types.ObjectId.isValid(String(pb.profileId))) {
      errors.push({
        field: 'partnerB.profileId',
        message: 'Must be a valid profile id',
      });
    }
    return errors;
  }

  const reqPartner = (label, p) => {
    if (!p.dateOfBirth) {
      errors.push({
        field: `${label}.dateOfBirth`,
        message: 'Required when useProfiles is false',
      });
    } else if (!parseIsoDateOnly(String(p.dateOfBirth))) {
      errors.push({
        field: `${label}.dateOfBirth`,
        message: 'Must be a valid ISO date (YYYY-MM-DD)',
      });
    }
    if (!p.birthTime || !String(p.birthTime).trim()) {
      errors.push({
        field: `${label}.birthTime`,
        message: 'Required when useProfiles is false',
      });
    } else if (!TIME_HHMM_RE.test(String(p.birthTime).trim())) {
      errors.push({
        field: `${label}.birthTime`,
        message: 'Must be in HH:mm format',
      });
    }
    if (!p.birthPlace || !String(p.birthPlace).trim()) {
      errors.push({
        field: `${label}.birthPlace`,
        message: 'Required when useProfiles is false',
      });
    }
  };

  reqPartner('partnerA', pa);
  reqPartner('partnerB', pb);

  return errors;
}

async function loadPartnerBirthForUser(userId, profileId) {
  const uid = mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : userId;
  const pid = new mongoose.Types.ObjectId(String(profileId));
  const row = await PartnerProfile.findOne({ _id: pid, userId: uid });
  if (!row) return null;
  return {
    dateOfBirth: row.dateOfBirth,
    birthTime: String(row.birthTime).trim(),
    birthPlace: String(row.birthPlace).trim(),
  };
}

/**
 * POST /api/josiyam/single
 * Auth: Bearer JWT
 */
async function single(req, res) {
  const userId = req.user?.userId;
  if (!userId) {
    return errorResponse(res, 'Unauthorized', 401);
  }

  const validationErrors = validateSingleBody(req.body);
  if (validationErrors.length > 0) {
    return errorResponse(res, 'Validation errors', 400, validationErrors);
  }

  const { useProfile, dateOfBirth, birthTime, birthPlace, language } = req.body;
  const lang = typeof language === 'string' && language.trim()
    ? language.trim()
    : 'ta-IN';

  try {
    let dob;
    let bt;
    let bp;

    if (useProfile === true) {
      const user = await User.findById(userId);
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }
      const profileErrors = getProfileIncompleteErrors(user);
      if (profileErrors.length > 0) {
        return errorResponse(
          res,
          'Profile incomplete for josiyam calculation',
          400,
          profileErrors
        );
      }
      dob = user.dob;
      bt = String(user.birthTime).trim();
      bp = String(user.birthPlace).trim();
    } else {
      dob = parseIsoDateOnly(String(dateOfBirth));
      bt = String(birthTime).trim();
      bp = String(birthPlace).trim();
    }

    const data = await JosiyamService.calculateSingle({
      userId,
      dateOfBirth: dob,
      birthTime: bt,
      birthPlace: bp,
      language: lang,
    });

    return successResponse(
      res,
      'Single-person josiyam generated successfully',
      data,
      200
    );
  } catch (err) {
    console.error('Josiyam single error:', err);
    const statusCode = err?.statusCode || 500;
    return errorResponse(
      res,
      err?.message || 'Failed to compute Josiyam',
      statusCode
    );
  }
}

/**
 * POST /api/josiyam/couple
 * Auth: Bearer JWT
 */
async function couple(req, res) {
  const userId = req.user?.userId;
  if (!userId) {
    return errorResponse(res, 'Unauthorized', 401);
  }

  const validationErrors = validateCoupleBody(req.body);
  if (validationErrors.length > 0) {
    return errorResponse(res, 'Validation errors', 400, validationErrors);
  }

  const { useProfiles, partnerA, partnerB, language } = req.body;
  const lang =
    typeof language === 'string' && language.trim()
      ? language.trim()
      : 'ta-IN';

  try {
    let birthA;
    let birthB;

    if (useProfiles === true) {
      birthA = await loadPartnerBirthForUser(userId, partnerA.profileId);
      birthB = await loadPartnerBirthForUser(userId, partnerB.profileId);
      if (!birthA) {
        return errorResponse(
          res,
          'Partner A profile not found',
          404,
          [{ field: 'partnerA.profileId', message: 'Not found or not owned by user' }]
        );
      }
      if (!birthB) {
        return errorResponse(
          res,
          'Partner B profile not found',
          404,
          [{ field: 'partnerB.profileId', message: 'Not found or not owned by user' }]
        );
      }
    } else {
      birthA = {
        dateOfBirth: parseIsoDateOnly(String(partnerA.dateOfBirth)),
        birthTime: String(partnerA.birthTime).trim(),
        birthPlace: String(partnerA.birthPlace).trim(),
      };
      birthB = {
        dateOfBirth: parseIsoDateOnly(String(partnerB.dateOfBirth)),
        birthTime: String(partnerB.birthTime).trim(),
        birthPlace: String(partnerB.birthPlace).trim(),
      };
    }

    const data = await JosiyamService.calculateCouple({
      userId,
      partnerA: birthA,
      partnerB: birthB,
      language: lang,
    });

    return successResponse(
      res,
      'Couple josiyam generated successfully',
      data,
      200
    );
  } catch (err) {
    console.error('Josiyam couple error:', err);
    const statusCode = err?.statusCode || 500;
    return errorResponse(
      res,
      err?.message || 'Failed to compute couple Josiyam',
      statusCode
    );
  }
}

/**
 * GET /api/josiyam/result/:resultId
 * Auth: Bearer JWT — returns stored chart/categories/summary for deep link / reopen.
 */
async function getStoredResult(req, res) {
  const userId = req.user?.userId;
  if (!userId) {
    return errorResponse(res, 'Unauthorized', 401);
  }

  const { resultId } = req.params;
  if (!resultId || !mongoose.Types.ObjectId.isValid(String(resultId))) {
    return errorResponse(res, 'Invalid resultId', 400);
  }

  try {
    const row = await JosiyamResult.findOne({
      _id: new mongoose.Types.ObjectId(String(resultId)),
      userId,
    }).lean();

    if (!row) {
      return errorResponse(res, 'Result not found', 404);
    }

    return successResponse(
      res,
      'Josiyam result loaded',
      {
        resultId: row._id.toString(),
        type: row.type,
        chart: row.chart,
        categories: row.categories,
        summary: row.summary,
        language: row.language,
      },
      200
    );
  } catch (err) {
    console.error('getStoredResult error:', err);
    return errorResponse(res, 'Failed to load result', 500);
  }
}

module.exports = {
  single,
  couple,
  getStoredResult,
};

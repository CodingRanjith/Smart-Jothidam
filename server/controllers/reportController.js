const mongoose = require('mongoose');
const JosiyamResult = require('../models/josiyamResultModel');
const { errorResponse } = require('../utils/responseHandler');
const { requirePremiumForExport } = require('../services/premiumService');
const { generatePdfBuffer } = require('../services/report/reportService');

/**
 * GET /api/report/pdf?resultId=&type=&language=
 * Auth: JWT. Premium gate when PREMIUM_GATE_ENABLED=true.
 */
async function pdf(req, res) {
  const userId = req.user?.userId;
  if (!userId) {
    return errorResponse(res, 'Unauthorized', 401);
  }

  const resultId = req.query?.resultId;
  const typeOpt = req.query?.type;
  const language =
    typeof req.query?.language === 'string' && req.query.language.trim()
      ? req.query.language.trim()
      : undefined;

  if (!resultId || typeof resultId !== 'string') {
    return errorResponse(res, 'resultId is required', 400);
  }

  if (!mongoose.Types.ObjectId.isValid(resultId)) {
    return errorResponse(res, 'Invalid resultId', 400);
  }

  if (
    typeOpt != null &&
    typeOpt !== '' &&
    typeOpt !== 'single' &&
    typeOpt !== 'couple'
  ) {
    return errorResponse(res, 'type must be single or couple', 400);
  }

  try {
    await requirePremiumForExport(userId);
  } catch (e) {
    if (e?.statusCode === 403) {
      return errorResponse(res, 'Not premium', 403, []);
    }
    throw e;
  }

  const row = await JosiyamResult.findOne({
    _id: new mongoose.Types.ObjectId(resultId),
    userId,
  }).lean();

  if (!row) {
    return errorResponse(res, 'Result not found', 404);
  }

  if (typeOpt && typeOpt !== row.type) {
    return errorResponse(res, 'type does not match stored result', 400);
  }

  try {
    const buf = await generatePdfBuffer({
      type: row.type,
      chart: row.chart || {},
      categories: row.categories || [],
      summary: row.summary || {},
      language: language || row.language,
    });

    const filename = `josiyam-report-${resultId}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buf.length);
    return res.status(200).send(buf);
  } catch (err) {
    console.error('PDF generation failed:', err);
    return errorResponse(res, 'Failed to generate PDF', 500);
  }
}

module.exports = {
  pdf,
};

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const FONT_PATH = path.join(__dirname, '../../assets/fonts/NotoSansTamil-Regular.ttf');

function resolveFont() {
  try {
    if (fs.existsSync(FONT_PATH)) {
      return { name: 'AppReport', path: FONT_PATH };
    }
  } catch {
    // fall through
  }
  return null;
}

/**
 * @param {object} params
 * @param {'single'|'couple'} params.type
 * @param {object} params.chart - API chart object
 * @param {Array} params.categories - API categories array
 * @param {object} params.summary - { aiText, language }
 * @param {string} [params.language]
 * @returns {Promise<Buffer>}
 */
function generatePdfBuffer({ type, chart, categories, summary, language }) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4',
      autoFirstPage: true,
    });

    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const fontInfo = resolveFont();
    if (fontInfo) {
      doc.registerFont(fontInfo.name, fontInfo.path);
      doc.font(fontInfo.name);
    } else {
      doc.font('Helvetica');
    }

    const lang = language || summary?.language || 'ta-IN';
    const title = 'Smart Jothidam — Josiyam Report';

    doc.fontSize(18).text(title, { align: 'center' });
    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .text(`Type: ${type} · Language: ${lang}`, { align: 'center' });
    doc.moveDown(1.5);

    doc.fontSize(13).text(type === 'single' ? 'Chart' : 'Charts', { underline: true });
    doc.moveDown(0.3);

    if (type === 'single') {
      doc.fontSize(10);
      doc.text(`Rasi: ${chart?.rasi ?? ''}`);
      doc.text(`Nakshatra: ${chart?.nakshatra ?? ''}`);
      doc.text(`Lagnam: ${chart?.lagnam ?? ''}`);
      doc.text(`Ayanamsa: ${chart?.ayanamsa ?? ''}`);
    } else {
      const a = chart?.partnerA ?? {};
      const b = chart?.partnerB ?? {};
      doc.fontSize(10);
      doc.text(`Ayanamsa: ${chart?.ayanamsa ?? ''}`);
      doc.moveDown(0.3);
      doc.fontSize(11).text('Partner A', { underline: true });
      doc.fontSize(10);
      doc.text(`Rasi: ${a.rasi ?? ''}`);
      doc.text(`Nakshatra: ${a.nakshatra ?? ''}`);
      doc.text(`Lagnam: ${a.lagnam ?? ''}`);
      doc.moveDown(0.3);
      doc.fontSize(11).text('Partner B', { underline: true });
      doc.fontSize(10);
      doc.text(`Rasi: ${b.rasi ?? ''}`);
      doc.text(`Nakshatra: ${b.nakshatra ?? ''}`);
      doc.text(`Lagnam: ${b.lagnam ?? ''}`);
    }

    doc.moveDown();
    doc.fontSize(13).text('Summary', { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(10).text(summary?.aiText || '', {
      width: 500,
      align: 'left',
    });

    doc.moveDown();
    doc.fontSize(13).text('Categories', { underline: true });
    doc.moveDown(0.5);

    const list = Array.isArray(categories) ? categories : [];
    for (const c of list) {
      const key = (c.key || '').toString().replace(/_/g, ' ');
      const line = `${key} — Score: ${c.score ?? '—'}/5 · ${c.trend ?? ''}`;
      doc.fontSize(10).text(line, { width: 500 });
      const body = (c.aiText || '').toString();
      if (body) {
        doc.fontSize(9).text(body, { width: 500 });
      }
      doc.moveDown(0.6);
    }

    doc.end();
  });
}

module.exports = {
  generatePdfBuffer,
};

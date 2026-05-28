import '../../domain/entities/couple_josiyam_chart_entity.dart';
import '../../domain/entities/couple_josiyam_result_entity.dart';
import '../../domain/entities/josiyam_ai_narrative_entity.dart';
import '../../domain/entities/josiyam_category_entity.dart';
import '../../domain/entities/josiyam_chart_entity.dart';

const Map<String, String> _coupleApiKeyToDisplayTitle = {
  'compatibility_score': 'Compatibility score',
  'emotional_bond': 'Emotional bond',
  'financial_stability': 'Financial stability',
  'family_harmony': 'Family harmony',
  'long_term_growth': 'Long-term growth',
  'career': 'Career',
  'business': 'Business',
  'finance': 'Finance',
  'education': 'Education',
  'marriage': 'Marriage',
  'love': 'Love',
  'family': 'Family',
  'children': 'Children',
  'health': 'Health',
  'mental_strength': 'Mental strength',
  'spiritual': 'Spiritual',
  'foreign_travel': 'Foreign travel',
  'property': 'Property',
  'legal': 'Legal',
  'enemy': 'Enemy',
  'social_status': 'Social status',
  'friends': 'Friends',
  'luck': 'Luck',
  'remedies': 'Remedies',
  'overall_life_path': 'Overall life path',
};

class CoupleJosiyamResultModel extends CoupleJosiyamResultEntity {
  const CoupleJosiyamResultModel({
    super.resultId,
    required super.chart,
    required super.categories,
    super.aiNarrative,
  });

  static JosiyamChartEntity _chartFromJson(Map<String, dynamic> j) {
    final ayanamsaVal = j['ayanamsa'];
    final ayanamsaStr = ayanamsaVal is num
        ? ayanamsaVal.toString()
        : (ayanamsaVal?.toString() ?? '');
    return JosiyamChartEntity(
      rasi: j['rasi']?.toString() ?? '',
      nakshatra: j['nakshatra']?.toString() ?? '',
      lagnam: j['lagnam']?.toString() ?? '',
      ayanamsa: ayanamsaStr,
    );
  }

  factory CoupleJosiyamResultModel.fromJson(Map<String, dynamic> json) {
    final resultId = json['resultId']?.toString();

    final chartJson = (json['chart'] as Map<String, dynamic>?) ?? {};
    final topAyanamsa = chartJson['ayanamsa']?.toString() ?? 'Lahiri';
    final pa = chartJson['partnerA'];
    final pb = chartJson['partnerB'];
    final partnerA = pa is Map<String, dynamic>
        ? _chartFromJson(pa)
        : const JosiyamChartEntity(
            rasi: '',
            nakshatra: '',
            lagnam: '',
            ayanamsa: '',
          );
    final partnerB = pb is Map<String, dynamic>
        ? _chartFromJson(pb)
        : const JosiyamChartEntity(
            rasi: '',
            nakshatra: '',
            lagnam: '',
            ayanamsa: '',
          );
    final meta = chartJson['compatibilityMeta'];
    final compatibilityMeta =
        meta is Map<String, dynamic> ? meta : null;

    final chart = CoupleJosiyamChartEntity(
      ayanamsa: topAyanamsa,
      partnerA: partnerA,
      partnerB: partnerB,
      compatibilityMeta: compatibilityMeta,
    );

    final summaryJson = (json['summary'] as Map<String, dynamic>?) ?? {};
    final summaryLang = summaryJson['language']?.toString() ?? 'ta-IN';
    final summaryText = summaryJson['aiText']?.toString() ?? '';

    final categoriesList = json['categories'];
    final categories = <String, JosiyamCategoryEntity>{};
    final narrativeCategoryMap = <String, String>{};

    if (categoriesList is List) {
      for (final item in categoriesList) {
        if (item is! Map<String, dynamic>) continue;
        final apiKey = item['key']?.toString() ?? '';
        final title = _coupleApiKeyToDisplayTitle[apiKey] ??
            _titleCase(apiKey.replaceAll('_', ' '));

        final score = (item['score'] as num?)?.toInt() ?? 0;
        final raw = item['raw'];
        final notes = raw is Map ? raw['notes']?.toString() ?? '' : '';
        final aiText = item['aiText']?.toString();
        final trend = item['trend']?.toString();

        categories[title] = JosiyamCategoryEntity(
          score: score,
          keywords: const [],
          rawInterpretation: notes,
          aiNarrative: aiText,
          trend: trend,
        );
        if (apiKey.isNotEmpty && (aiText ?? '').trim().isNotEmpty) {
          narrativeCategoryMap[title] = aiText!.trim();
        }
      }
    }

    final aiNarrative = JosiyamAiNarrativeEntity(
      language: summaryLang,
      summary: summaryText,
      categories: narrativeCategoryMap,
    );

    return CoupleJosiyamResultModel(
      resultId: resultId,
      chart: chart,
      categories: categories,
      aiNarrative: aiNarrative,
    );
  }

  static String _titleCase(String s) {
    if (s.isEmpty) return s;
    return s.split(' ').map((w) {
      if (w.isEmpty) return w;
      return w[0].toUpperCase() + w.substring(1).toLowerCase();
    }).join(' ');
  }
}

import '../../domain/entities/josiyam_ai_narrative_entity.dart';
import '../../domain/entities/josiyam_chart_entity.dart';
import '../../domain/entities/josiyam_category_entity.dart';
import '../../domain/entities/josiyam_overall_life_path_entity.dart';
import '../../domain/entities/josiyam_result_entity.dart';

/// Single-person `/api/josiyam/single` response (chart + 20 categories + summary).
typedef SingleJosiyamModel = JosiyamResultModel;

/// Maps API `categories[].key` (snake_case) to UI labels (same as deterministic engine).
const Map<String, String> _apiKeyToDisplayTitle = {
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

class JosiyamResultModel extends JosiyamResultEntity {
  const JosiyamResultModel({
    super.resultId,
    required super.chart,
    required super.categories,
    required super.overallLifePath,
    required super.transparency,
    super.aiNarrative,
  });

  factory JosiyamResultModel.fromJson(Map<String, dynamic> json) {
    final resultId = json['resultId']?.toString();

    final chartJson = (json['chart'] as Map<String, dynamic>?) ?? {};
    final ayanamsaVal = chartJson['ayanamsa'];
    final ayanamsaStr = ayanamsaVal is num
        ? ayanamsaVal.toString()
        : (ayanamsaVal?.toString() ?? '');

    final chart = JosiyamChartEntity(
      rasi: chartJson['rasi']?.toString() ?? '',
      nakshatra: chartJson['nakshatra']?.toString() ?? '',
      lagnam: chartJson['lagnam']?.toString() ?? '',
      ayanamsa: ayanamsaStr,
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
        final title =
            _apiKeyToDisplayTitle[apiKey] ?? _titleCase(apiKey.replaceAll('_', ' '));

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

    JosiyamOverallLifePathEntity overallLifePath;
    final overall = categories['Overall life path'];
    if (overall != null) {
      overallLifePath = JosiyamOverallLifePathEntity(
        score: overall.score,
        keywords: const [],
        rawInterpretation: overall.rawInterpretation,
      );
    } else {
      overallLifePath = JosiyamOverallLifePathEntity(
        score: 0,
        keywords: const [],
        rawInterpretation: summaryText,
      );
    }

    final transparency = (json['transparency'] as Map<String, dynamic>?) ?? {};

    final aiNarrative = JosiyamAiNarrativeEntity(
      language: summaryLang,
      summary: summaryText,
      categories: narrativeCategoryMap,
    );

    return JosiyamResultModel(
      resultId: resultId,
      chart: chart,
      categories: categories,
      overallLifePath: overallLifePath,
      transparency: transparency,
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

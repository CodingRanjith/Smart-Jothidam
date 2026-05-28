import 'package:equatable/equatable.dart';

import 'josiyam_ai_narrative_entity.dart';
import 'josiyam_chart_entity.dart';
import 'josiyam_category_entity.dart';
import 'josiyam_overall_life_path_entity.dart';

class JosiyamResultEntity extends Equatable {
  /// MongoDB `JosiyamResult` id (for PDF / deep link).
  final String? resultId;
  final JosiyamChartEntity chart;
  final Map<String, JosiyamCategoryEntity> categories;
  final JosiyamOverallLifePathEntity overallLifePath;
  final Map<String, dynamic> transparency;
  final JosiyamAiNarrativeEntity? aiNarrative;

  const JosiyamResultEntity({
    this.resultId,
    required this.chart,
    required this.categories,
    required this.overallLifePath,
    required this.transparency,
    this.aiNarrative,
  });

  String _categoryScoreSignature() {
    final entries = categories.entries.toList();
    entries.sort((a, b) => a.key.compareTo(b.key));
    return entries.map((e) => '${e.key}:${e.value.score}').join('|');
  }

  @override
  List<Object?> get props => [
        resultId,
        chart,
        overallLifePath,
        aiNarrative?.summary,
        _categoryScoreSignature(),
      ];
}


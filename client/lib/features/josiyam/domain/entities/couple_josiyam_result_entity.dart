import 'package:equatable/equatable.dart';

import 'couple_josiyam_chart_entity.dart';
import 'josiyam_ai_narrative_entity.dart';
import 'josiyam_category_entity.dart';

class CoupleJosiyamResultEntity extends Equatable {
  final String? resultId;
  final CoupleJosiyamChartEntity chart;
  final Map<String, JosiyamCategoryEntity> categories;
  final JosiyamAiNarrativeEntity? aiNarrative;

  const CoupleJosiyamResultEntity({
    this.resultId,
    required this.chart,
    required this.categories,
    this.aiNarrative,
  });

  @override
  List<Object?> get props => [resultId, chart, categories, aiNarrative?.summary];
}

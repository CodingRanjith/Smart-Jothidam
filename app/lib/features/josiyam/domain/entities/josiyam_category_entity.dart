import 'package:equatable/equatable.dart';

class JosiyamCategoryEntity extends Equatable {
  /// 1–5 scale from API (Module 3 contract).
  final int score;
  final List<String> keywords;
  final String rawInterpretation;
  final String? aiNarrative;
  final String? trend;

  const JosiyamCategoryEntity({
    required this.score,
    required this.keywords,
    required this.rawInterpretation,
    this.aiNarrative,
    this.trend,
  });

  @override
  List<Object?> get props => [score, keywords, rawInterpretation, aiNarrative, trend];
}


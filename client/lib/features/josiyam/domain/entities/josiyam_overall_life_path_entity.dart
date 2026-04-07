import 'package:equatable/equatable.dart';

class JosiyamOverallLifePathEntity extends Equatable {
  final int score;
  final List<String> keywords;
  final String rawInterpretation;

  const JosiyamOverallLifePathEntity({
    required this.score,
    required this.keywords,
    required this.rawInterpretation,
  });

  @override
  List<Object?> get props => [score, keywords, rawInterpretation];
}


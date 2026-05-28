import 'package:equatable/equatable.dart';

class JosiyamAiNarrativeEntity extends Equatable {
  final String language;
  final String summary;
  final Map<String, String> categories;

  const JosiyamAiNarrativeEntity({
    required this.language,
    required this.summary,
    required this.categories,
  });

  @override
  List<Object?> get props => [language, summary, categories];
}


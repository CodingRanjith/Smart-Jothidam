import 'package:equatable/equatable.dart';

abstract class JosiyamEvent extends Equatable {
  const JosiyamEvent();

  @override
  List<Object?> get props => [];
}

/// Dispatched when the UI wants chart + 20 categories from `/josiyam/single` (profile or manual birth data).
class FetchSingleJosiyamRequested extends JosiyamEvent {
  final bool useProfile;
  final String? language;

  const FetchSingleJosiyamRequested({
    this.useProfile = true,
    this.language,
  });

  @override
  List<Object?> get props => [useProfile, language];
}

/// Load a previously saved result (GET `/api/josiyam/result/:resultId`).
class LoadSingleJosiyamByResultId extends JosiyamEvent {
  final String resultId;

  const LoadSingleJosiyamByResultId(this.resultId);

  @override
  List<Object?> get props => [resultId];
}

import 'package:equatable/equatable.dart';

import '../../domain/entities/josiyam_result_entity.dart';

abstract class JosiyamState extends Equatable {
  const JosiyamState();

  @override
  List<Object?> get props => [];
}

class SingleJosiyamInitial extends JosiyamState {
  const SingleJosiyamInitial();
}

class SingleJosiyamLoading extends JosiyamState {
  const SingleJosiyamLoading();
}

class SingleJosiyamLoaded extends JosiyamState {
  final JosiyamResultEntity result;

  const SingleJosiyamLoaded({required this.result});

  @override
  List<Object?> get props => [result];
}

class SingleJosiyamError extends JosiyamState {
  final String message;

  const SingleJosiyamError({required this.message});

  @override
  List<Object?> get props => [message];
}

class SingleJosiyamProfileIncomplete extends JosiyamState {
  final List<String> missingFields;

  const SingleJosiyamProfileIncomplete({required this.missingFields});

  @override
  List<Object?> get props => [missingFields.join(',')];
}

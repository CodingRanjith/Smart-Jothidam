import 'package:equatable/equatable.dart';

import '../../domain/entities/couple_josiyam_result_entity.dart';
import '../../domain/entities/partner_profile_entity.dart';

abstract class CoupleJosiyamState extends Equatable {
  const CoupleJosiyamState();

  @override
  List<Object?> get props => [];
}

class CoupleJosiyamInitial extends CoupleJosiyamState {
  const CoupleJosiyamInitial();
}

/// Partners list is loading (first paint).
class CoupleJosiyamPartnersLoading extends CoupleJosiyamState {
  const CoupleJosiyamPartnersLoading();
}

/// Ready to collect input; includes saved partners (may be empty).
class CoupleJosiyamReady extends CoupleJosiyamState {
  final List<PartnerProfileEntity> partners;

  const CoupleJosiyamReady({required this.partners});

  @override
  List<Object?> get props => [partners.length, partners.map((e) => e.id).join(',')];
}

class CoupleJosiyamSubmitting extends CoupleJosiyamState {
  final List<PartnerProfileEntity> partners;

  const CoupleJosiyamSubmitting({required this.partners});

  @override
  List<Object?> get props => [partners.length];
}

class CoupleJosiyamLoadSuccess extends CoupleJosiyamState {
  final CoupleJosiyamResultEntity result;
  final List<PartnerProfileEntity> partners;

  const CoupleJosiyamLoadSuccess({
    required this.result,
    required this.partners,
  });

  @override
  List<Object?> get props => [result, partners.length];
}

class CoupleJosiyamError extends CoupleJosiyamState {
  final String message;
  final List<PartnerProfileEntity> partners;

  const CoupleJosiyamError({
    required this.message,
    this.partners = const [],
  });

  @override
  List<Object?> get props => [message, partners.length];
}

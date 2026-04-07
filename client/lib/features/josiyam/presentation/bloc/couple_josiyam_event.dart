import 'package:equatable/equatable.dart';

import '../../domain/entities/partner_profile_entity.dart';

abstract class CoupleJosiyamEvent extends Equatable {
  const CoupleJosiyamEvent();

  @override
  List<Object?> get props => [];
}

/// Load saved partner profiles for the logged-in user.
class LoadCouplePartnersRequested extends CoupleJosiyamEvent {
  const LoadCouplePartnersRequested();
}

/// POST `/josiyam/couple` with a body matching the backend contract.
class FetchCoupleJosiyamRequested extends CoupleJosiyamEvent {
  final Map<String, dynamic> body;
  final List<PartnerProfileEntity> partnersSnapshot;

  const FetchCoupleJosiyamRequested(
    this.body, {
    this.partnersSnapshot = const [],
  });

  @override
  List<Object?> get props => [body, partnersSnapshot.length];
}

/// Return to the input form after viewing results (keeps loaded partner list).
class ResetCoupleJosiyamForm extends CoupleJosiyamEvent {
  final List<PartnerProfileEntity> partners;

  const ResetCoupleJosiyamForm(this.partners);

  @override
  List<Object?> get props => [partners.length];
}

/// GET `/api/josiyam/result/:resultId` when [type] is couple.
class LoadCoupleJosiyamByResultId extends CoupleJosiyamEvent {
  final String resultId;

  const LoadCoupleJosiyamByResultId(this.resultId);

  @override
  List<Object?> get props => [resultId];
}

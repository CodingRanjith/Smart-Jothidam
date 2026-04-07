import 'package:equatable/equatable.dart';

import 'josiyam_chart_entity.dart';

class CoupleJosiyamChartEntity extends Equatable {
  final String ayanamsa;
  final JosiyamChartEntity partnerA;
  final JosiyamChartEntity partnerB;
  final Map<String, dynamic>? compatibilityMeta;

  const CoupleJosiyamChartEntity({
    required this.ayanamsa,
    required this.partnerA,
    required this.partnerB,
    this.compatibilityMeta,
  });

  @override
  List<Object?> get props => [ayanamsa, partnerA, partnerB, compatibilityMeta];
}

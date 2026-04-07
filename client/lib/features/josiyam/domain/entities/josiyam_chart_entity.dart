import 'package:equatable/equatable.dart';

class JosiyamChartEntity extends Equatable {
  final String rasi;
  final String nakshatra;
  final String lagnam;
  /// API returns the ayanamsa label (e.g. `Lahiri`).
  final String ayanamsa;

  const JosiyamChartEntity({
    required this.rasi,
    required this.nakshatra,
    required this.lagnam,
    required this.ayanamsa,
  });

  @override
  List<Object?> get props => [rasi, nakshatra, lagnam, ayanamsa];
}


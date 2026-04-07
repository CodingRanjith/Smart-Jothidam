import 'package:equatable/equatable.dart';

class PartnerProfileEntity extends Equatable {
  final String id;
  final String displayName;
  final String dateOfBirth;
  final String birthTime;
  final String birthPlace;

  const PartnerProfileEntity({
    required this.id,
    required this.displayName,
    required this.dateOfBirth,
    required this.birthTime,
    required this.birthPlace,
  });

  @override
  List<Object?> get props => [id, displayName, dateOfBirth, birthTime, birthPlace];
}

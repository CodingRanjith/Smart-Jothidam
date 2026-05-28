import '../../domain/entities/partner_profile_entity.dart';

class PartnerProfileModel extends PartnerProfileEntity {
  const PartnerProfileModel({
    required super.id,
    required super.displayName,
    required super.dateOfBirth,
    required super.birthTime,
    required super.birthPlace,
  });

  factory PartnerProfileModel.fromJson(Map<String, dynamic> json) {
    return PartnerProfileModel(
      id: json['id']?.toString() ?? '',
      displayName: json['displayName']?.toString() ?? '',
      dateOfBirth: json['dateOfBirth']?.toString() ?? '',
      birthTime: json['birthTime']?.toString() ?? '',
      birthPlace: json['birthPlace']?.toString() ?? '',
    );
  }
}

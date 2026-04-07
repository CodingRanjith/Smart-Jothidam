import 'package:equatable/equatable.dart';

class UserEntity extends Equatable {
  final String userId;
  final String? email;
  final String name;
  final DateTime? dob;
  final String? birthTime;
  final String? birthPlace;
  final String? phone;
  final bool mobileVerified;
  final bool isPremium;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const UserEntity({
    required this.userId,
    this.email,
    required this.name,
    this.dob,
    this.birthTime,
    this.birthPlace,
    this.phone,
    this.mobileVerified = false,
    this.isPremium = false,
    this.createdAt,
    this.updatedAt,
  });

  @override
  List<Object?> get props => [
        userId,
        email,
        name,
        dob,
        birthTime,
        birthPlace,
        phone,
        mobileVerified,
        isPremium,
        createdAt,
        updatedAt,
      ];
}

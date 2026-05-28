import '../../domain/entities/user_entity.dart';

class UserModel extends UserEntity {
  const UserModel({
    required super.userId,
    super.email,
    required super.name,
    super.dob,
    super.birthTime,
    super.birthPlace,
    super.phone,
    super.mobileVerified,
    super.isPremium,
    super.createdAt,
    super.updatedAt,
  });

  static DateTime? _parseDate(dynamic v) {
    if (v == null) return null;
    if (v is DateTime) return v;
    return DateTime.tryParse(v.toString());
  }

  // From JSON
  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      userId: json['id']?.toString() ?? '',
      email: json['email'],
      name: json['name'] ?? '',
      dob: _parseDate(json['dob']),
      birthTime: json['birthTime']?.toString(),
      birthPlace: json['birthPlace']?.toString(),
      phone: json['phone']?.toString(),
      mobileVerified: json['mobileVerified'] == true,
      isPremium: json['isPremium'] == true,
      createdAt: _parseDate(json['createdAt']),
      updatedAt: _parseDate(json['updatedAt']),
    );
  }

  // To JSON
  Map<String, dynamic> toJson() {
    return {
      'id': userId,
      'email': email,
      'name': name,
      'dob': dob?.toIso8601String(),
      'birthTime': birthTime,
      'birthPlace': birthPlace,
      'phone': phone,
      'mobileVerified': mobileVerified,
      'isPremium': isPremium,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  // Copy with
  UserModel copyWith({
    String? userId,
    String? email,
    String? name,
    DateTime? dob,
    String? birthTime,
    String? birthPlace,
    String? phone,
    bool? mobileVerified,
    bool? isPremium,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return UserModel(
      userId: userId ?? this.userId,
      email: email ?? this.email,
      name: name ?? this.name,
      dob: dob ?? this.dob,
      birthTime: birthTime ?? this.birthTime,
      birthPlace: birthPlace ?? this.birthPlace,
      phone: phone ?? this.phone,
      mobileVerified: mobileVerified ?? this.mobileVerified,
      isPremium: isPremium ?? this.isPremium,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

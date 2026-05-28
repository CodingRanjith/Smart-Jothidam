import '../entities/user_entity.dart';

abstract class AuthRepository {
  Future<UserEntity> registerUser({
    required String phone,
    required String password,
    required String name,
    DateTime? dob,
    String? birthTime,
    String? birthPlace,
  });

  Future<UserEntity> loginUser(String phone, String password);

  Future<void> sendPasswordResetEmail(String email);

  Future<void> logout();

  Future<UserEntity> getProfile();

  Future<UserEntity> updateProfile({
    String? name,
    DateTime? dob,
    String? birthTime,
    String? birthPlace,
    String? phone,
  });

  Future<void> reloadUser();

  /// Current JWT from secure storage, if any.
  String? getToken();
}

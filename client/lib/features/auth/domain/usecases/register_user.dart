import '../entities/user_entity.dart';
import '../repositories/auth_repository.dart';

class RegisterUser {
  final AuthRepository _repository;

  RegisterUser(this._repository);

  Future<UserEntity> call({
    required String phone,
    required String password,
    required String name,
    DateTime? dob,
    String? birthTime,
    String? birthPlace,
  }) async {
    return await _repository.registerUser(
      phone: phone,
      password: password,
      name: name,
      dob: dob,
      birthTime: birthTime,
      birthPlace: birthPlace,
    );
  }
}

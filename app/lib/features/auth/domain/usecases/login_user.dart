import '../entities/user_entity.dart';
import '../repositories/auth_repository.dart';

class LoginUser {
  final AuthRepository _repository;

  LoginUser(this._repository);

  Future<UserEntity> call(String phone, String password) async {
    return await _repository.loginUser(phone, password);
  }
}

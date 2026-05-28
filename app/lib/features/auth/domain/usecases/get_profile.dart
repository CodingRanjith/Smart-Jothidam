import '../entities/user_entity.dart';
import '../repositories/auth_repository.dart';

class GetProfile {
  final AuthRepository _repository;

  GetProfile(this._repository);

  Future<UserEntity> call() async {
    return await _repository.getProfile();
  }
}

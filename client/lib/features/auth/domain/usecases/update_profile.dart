import '../entities/user_entity.dart';
import '../repositories/auth_repository.dart';

class UpdateProfile {
  final AuthRepository _repository;

  UpdateProfile(this._repository);

  Future<UserEntity> call({
    String? name,
    DateTime? dob,
    String? birthTime,
    String? birthPlace,
    String? phone,
  }) async {
    return await _repository.updateProfile(
      name: name,
      dob: dob,
      birthTime: birthTime,
      birthPlace: birthPlace,
      phone: phone,
    );
  }
}

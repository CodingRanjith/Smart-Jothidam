import '../repositories/auth_repository.dart';

class ForgotPassword {
  final AuthRepository _repository;

  ForgotPassword(this._repository);

  Future<void> call(String email) async {
    await _repository.sendPasswordResetEmail(email);
  }
}

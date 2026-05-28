import '../entities/stored_josiyam_bundle.dart';
import '../repositories/josiyam_repository.dart';

class GetStoredJosiyamResult {
  final JosiyamRepository _repository;

  GetStoredJosiyamResult(this._repository);

  Future<StoredJosiyamBundle> call(String resultId) {
    return _repository.getStoredJosiyamResult(resultId);
  }
}

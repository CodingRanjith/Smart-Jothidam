import '../entities/couple_josiyam_result_entity.dart';
import '../repositories/josiyam_repository.dart';

class GetCoupleJosiyam {
  final JosiyamRepository _repository;

  GetCoupleJosiyam(this._repository);

  Future<CoupleJosiyamResultEntity> call(Map<String, dynamic> body) {
    return _repository.getCoupleJosiyam(body);
  }
}

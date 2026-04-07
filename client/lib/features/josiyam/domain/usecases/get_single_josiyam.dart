import '../entities/josiyam_result_entity.dart';
import '../repositories/josiyam_repository.dart';

class GetSingleJosiyam {
  final JosiyamRepository _repository;

  GetSingleJosiyam(this._repository);

  Future<JosiyamResultEntity> call({
    required bool useProfile,
    String? language,
    String? dateOfBirth,
    String? birthTime,
    String? birthPlace,
  }) {
    return _repository.getSingleJosiyam(
      useProfile: useProfile,
      language: language,
      dateOfBirth: dateOfBirth,
      birthTime: birthTime,
      birthPlace: birthPlace,
    );
  }
}

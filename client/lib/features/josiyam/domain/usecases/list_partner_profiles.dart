import '../entities/partner_profile_entity.dart';
import '../repositories/josiyam_repository.dart';

class ListPartnerProfiles {
  final JosiyamRepository _repository;

  ListPartnerProfiles(this._repository);

  Future<List<PartnerProfileEntity>> call() {
    return _repository.listPartnerProfiles();
  }
}

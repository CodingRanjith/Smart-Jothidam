import 'dart:typed_data';

import '../entities/couple_josiyam_result_entity.dart';
import '../entities/josiyam_result_entity.dart';
import '../entities/partner_profile_entity.dart';
import '../entities/stored_josiyam_bundle.dart';

abstract class JosiyamRepository {
  Future<JosiyamResultEntity> getSingleJosiyam({
    required bool useProfile,
    String? language,
    String? dateOfBirth,
    String? birthTime,
    String? birthPlace,
  });

  Future<List<PartnerProfileEntity>> listPartnerProfiles();

  Future<CoupleJosiyamResultEntity> getCoupleJosiyam(Map<String, dynamic> body);

  /// GET `/api/josiyam/result/:resultId`
  Future<StoredJosiyamBundle> getStoredJosiyamResult(String resultId);

  /// GET `/api/report/pdf` — binary PDF (premium when server gate is on).
  Future<Uint8List> downloadReportPdf({
    required String resultId,
    String? type,
    String? language,
  });
}

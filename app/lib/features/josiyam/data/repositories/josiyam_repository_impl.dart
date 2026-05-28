import 'dart:typed_data';

import 'package:shared_preferences/shared_preferences.dart';

import '../../../../core/constants/app_constants.dart';
import '../../domain/entities/couple_josiyam_result_entity.dart';
import '../../domain/entities/josiyam_result_entity.dart';
import '../../domain/entities/partner_profile_entity.dart';
import '../../domain/entities/stored_josiyam_bundle.dart';
import '../../domain/repositories/josiyam_repository.dart';
import '../datasources/josiyam_remote_datasource.dart';

class JosiyamRepositoryImpl implements JosiyamRepository {
  final SharedPreferences _prefs;
  final JosiyamRemoteDataSource _remoteDataSource;

  JosiyamRepositoryImpl({
    required SharedPreferences prefs,
    required JosiyamRemoteDataSource remoteDataSource,
  })  : _prefs = prefs,
        _remoteDataSource = remoteDataSource;

  String? _getToken() => _prefs.getString(AppConstants.tokenKey);

  @override
  Future<JosiyamResultEntity> getSingleJosiyam({
    required bool useProfile,
    String? language,
    String? dateOfBirth,
    String? birthTime,
    String? birthPlace,
  }) async {
    final token = _getToken();
    if (token == null || token.isEmpty) {
      throw const JosiyamException('Not authenticated');
    }

    final model = await _remoteDataSource.getSingleJosiyam(
      token: token,
      useProfile: useProfile,
      language: language,
      dateOfBirth: dateOfBirth,
      birthTime: birthTime,
      birthPlace: birthPlace,
    );

    return model;
  }

  @override
  Future<List<PartnerProfileEntity>> listPartnerProfiles() async {
    final token = _getToken();
    if (token == null || token.isEmpty) {
      throw const JosiyamException('Not authenticated');
    }
    return _remoteDataSource.listPartnerProfiles(token: token);
  }

  @override
  Future<CoupleJosiyamResultEntity> getCoupleJosiyam(
    Map<String, dynamic> body,
  ) async {
    final token = _getToken();
    if (token == null || token.isEmpty) {
      throw const JosiyamException('Not authenticated');
    }
    final model = await _remoteDataSource.getCoupleJosiyam(
      token: token,
      body: body,
    );
    return model;
  }

  @override
  Future<StoredJosiyamBundle> getStoredJosiyamResult(String resultId) async {
    final token = _getToken();
    if (token == null || token.isEmpty) {
      throw const JosiyamException('Not authenticated');
    }
    return _remoteDataSource.getStoredJosiyamResult(
      token: token,
      resultId: resultId,
    );
  }

  @override
  Future<Uint8List> downloadReportPdf({
    required String resultId,
    String? type,
    String? language,
  }) async {
    final token = _getToken();
    if (token == null || token.isEmpty) {
      throw const JosiyamException('Not authenticated');
    }
    return _remoteDataSource.downloadReportPdf(
      token: token,
      resultId: resultId,
      type: type,
      language: language,
    );
  }
}

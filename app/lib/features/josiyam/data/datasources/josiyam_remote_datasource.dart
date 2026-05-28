import 'dart:typed_data';

import 'package:dio/dio.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_service.dart';
import '../../domain/entities/stored_josiyam_bundle.dart';
import '../models/couple_josiyam_result_model.dart';
import '../models/josiyam_result_model.dart';
import '../models/partner_profile_model.dart';

bool _isProfileIncompleteMessage(String? message) {
  return message == 'Profile incomplete for josiyam calculation' ||
      message == 'PROFILE_INCOMPLETE';
}

List<String> _fieldNamesFromErrors(dynamic errors) {
  if (errors is! List) return <String>[];
  return errors.map((e) {
    if (e is Map && e['field'] != null) {
      return e['field'].toString();
    }
    return e.toString();
  }).toList();
}

abstract class JosiyamRemoteDataSource {
  Future<JosiyamResultModel> getSingleJosiyam({
    required String token,
    required bool useProfile,
    String? language,
    String? dateOfBirth,
    String? birthTime,
    String? birthPlace,
  });

  Future<List<PartnerProfileModel>> listPartnerProfiles({required String token});

  Future<CoupleJosiyamResultModel> getCoupleJosiyam({
    required String token,
    required Map<String, dynamic> body,
  });

  Future<StoredJosiyamBundle> getStoredJosiyamResult({
    required String token,
    required String resultId,
  });

  Future<Uint8List> downloadReportPdf({
    required String token,
    required String resultId,
    String? type,
    String? language,
  });
}

class JosiyamException implements Exception {
  final String message;

  const JosiyamException(this.message);

  @override
  String toString() => message;
}

class JosiyamProfileIncompleteException implements Exception {
  final List<String> missingFields;

  const JosiyamProfileIncompleteException(this.missingFields);

  @override
  String toString() => 'PROFILE_INCOMPLETE';
}

class JosiyamRemoteDataSourceImpl implements JosiyamRemoteDataSource {
  final ApiService _apiService;

  JosiyamRemoteDataSourceImpl(this._apiService);

  String _messageFromDio(DioException e) {
    final data = e.response?.data;
    if (data is Map) {
      final m = data['message'];
      if (m is String && m.isNotEmpty) return m;
    }

    if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.sendTimeout ||
        e.type == DioExceptionType.receiveTimeout) {
      return 'Request timed out. If the server was sleeping (e.g. Render free tier), try again.';
    }

    if (e.type == DioExceptionType.connectionError) {
      return 'Could not reach the server. Check your network and API base URL.';
    }

    return e.toString();
  }

  @override
  Future<JosiyamResultModel> getSingleJosiyam({
    required String token,
    required bool useProfile,
    String? language,
    String? dateOfBirth,
    String? birthTime,
    String? birthPlace,
  }) async {
    try {
      final body = <String, dynamic>{
        'useProfile': useProfile,
      };
      if (language != null && language.isNotEmpty) {
        body['language'] = language;
      }
      if (!useProfile) {
        body['dateOfBirth'] = dateOfBirth;
        body['birthTime'] = birthTime;
        body['birthPlace'] = birthPlace;
      }

      final response = await _apiService.post(
        ApiConstants.singleJosiyamEndpoint,
        data: body,
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      final resBody = response.data as Map<String, dynamic>;
      if (resBody['success'] != true) {
        final message = resBody['message']?.toString() ?? 'Josiyam request failed';
        final errors = resBody['errors'];
        if (_isProfileIncompleteMessage(message)) {
          throw JosiyamProfileIncompleteException(
            _fieldNamesFromErrors(errors),
          );
        }
        if (errors is List && errors.isNotEmpty) {
          final first = errors.first;
          if (first is Map && first['message'] != null) {
            throw JosiyamException(first['message'].toString());
          }
        }
        throw JosiyamException(message);
      }

      final data = resBody['data'] as Map<String, dynamic>;
      return JosiyamResultModel.fromJson(data);
    } on DioException catch (e) {
      final data = e.response?.data;
      if (data is Map) {
        final message = data['message']?.toString();
        final errors = data['errors'];
        if (_isProfileIncompleteMessage(message)) {
          throw JosiyamProfileIncompleteException(
            _fieldNamesFromErrors(errors),
          );
        }
        if (errors is List && errors.isNotEmpty) {
          final first = errors.first;
          if (first is Map && first['message'] != null) {
            throw JosiyamException(first['message'].toString());
          }
        }
      }
      throw JosiyamException(_messageFromDio(e));
    }
  }

  @override
  Future<List<PartnerProfileModel>> listPartnerProfiles({
    required String token,
  }) async {
    try {
      final response = await _apiService.get(
        ApiConstants.partnersEndpoint,
        headers: {'Authorization': 'Bearer $token'},
      );
      final resBody = response.data as Map<String, dynamic>;
      if (resBody['success'] != true) {
        final message =
            resBody['message']?.toString() ?? 'Could not load partner profiles';
        throw JosiyamException(message);
      }
      final data = resBody['data'] as Map<String, dynamic>?;
      final list = data?['partners'];
      if (list is! List) return [];
      return list
          .whereType<Map<String, dynamic>>()
          .map(PartnerProfileModel.fromJson)
          .toList();
    } on DioException catch (e) {
      throw JosiyamException(_messageFromDio(e));
    }
  }

  @override
  Future<CoupleJosiyamResultModel> getCoupleJosiyam({
    required String token,
    required Map<String, dynamic> body,
  }) async {
    try {
      final response = await _apiService.post(
        ApiConstants.coupleJosiyamEndpoint,
        data: body,
        headers: {'Authorization': 'Bearer $token'},
      );

      final resBody = response.data as Map<String, dynamic>;
      if (resBody['success'] != true) {
        final message =
            resBody['message']?.toString() ?? 'Couple josiyam request failed';
        final errors = resBody['errors'];
        if (errors is List && errors.isNotEmpty) {
          final first = errors.first;
          if (first is Map && first['message'] != null) {
            throw JosiyamException(first['message'].toString());
          }
        }
        throw JosiyamException(message);
      }

      final data = resBody['data'] as Map<String, dynamic>;
      return CoupleJosiyamResultModel.fromJson(data);
    } on DioException catch (e) {
      final data = e.response?.data;
      if (data is Map) {
        final errors = data['errors'];
        if (errors is List && errors.isNotEmpty) {
          final first = errors.first;
          if (first is Map && first['message'] != null) {
            throw JosiyamException(first['message'].toString());
          }
        }
      }
      throw JosiyamException(_messageFromDio(e));
    }
  }

  @override
  Future<StoredJosiyamBundle> getStoredJosiyamResult({
    required String token,
    required String resultId,
  }) async {
    try {
      final response = await _apiService.get(
        ApiConstants.josiyamResultEndpoint(resultId),
        headers: {'Authorization': 'Bearer $token'},
      );

      final resBody = response.data as Map<String, dynamic>;
      if (resBody['success'] != true) {
        final message =
            resBody['message']?.toString() ?? 'Could not load saved result';
        throw JosiyamException(message);
      }

      final data = resBody['data'] as Map<String, dynamic>;
      final type = data['type']?.toString() ?? 'single';
      final rid = data['resultId']?.toString() ?? resultId;

      if (type == 'couple') {
        return StoredJosiyamBundle(
          resultId: rid,
          type: type,
          couple: CoupleJosiyamResultModel.fromJson(data),
        );
      }

      return StoredJosiyamBundle(
        resultId: rid,
        type: type,
        single: JosiyamResultModel.fromJson(data),
      );
    } on DioException catch (e) {
      throw JosiyamException(_messageFromDio(e));
    }
  }

  @override
  Future<Uint8List> downloadReportPdf({
    required String token,
    required String resultId,
    String? type,
    String? language,
  }) async {
    try {
      final response = await _apiService.getBytes(
        ApiConstants.reportPdfEndpoint,
        queryParameters: {
          'resultId': resultId,
          if (type != null && type.isNotEmpty) 'type': type,
          if (language != null && language.isNotEmpty) 'language': language,
        },
        headers: {
          'Authorization': 'Bearer $token',
          'Accept': 'application/pdf',
        },
      );

      final data = response.data;
      if (response.statusCode == 403) {
        final msg = _pdfErrorMessage(data);
        throw JosiyamException(msg ?? 'Not premium');
      }
      if (response.statusCode != 200) {
        final msg = _pdfErrorMessage(data) ?? 'PDF request failed';
        throw JosiyamException(msg);
      }

      if (data is Uint8List) return data;
      if (data is List<int>) return Uint8List.fromList(data);
      throw const JosiyamException('Invalid PDF response');
    } on DioException catch (e) {
      final status = e.response?.statusCode;
      final body = e.response?.data;
      if (status == 403) {
        throw JosiyamException(_pdfErrorMessage(body) ?? 'Not premium');
      }
      if (status != null && status != 200) {
        throw JosiyamException(_pdfErrorMessage(body) ?? _messageFromDio(e));
      }
      throw JosiyamException(_messageFromDio(e));
    }
  }

  String? _pdfErrorMessage(dynamic data) {
    if (data is Map) {
      final m = data['message'];
      if (m is String && m.isNotEmpty) return m;
    }
    return null;
  }
}

import 'package:dio/dio.dart';

import '../../../../core/network/api_service.dart';
import '../../../../core/constants/api_constants.dart';
import '../models/user_model.dart';

abstract class AuthRemoteDataSource {
  Future<RegisterResult> registerUser(Map<String, dynamic> userData);
  Future<LoginResult> loginUser({
    required String phone,
    required String password,
  });
  Future<void> forgotPassword(String phone);
  Future<UserModel> verifyToken(String token);
  Future<UserModel> getProfile(String token);
  Future<UserModel> updateProfile(
    String token,
    Map<String, dynamic> userData,
  );
}

class LoginResult {
  final String token;
  final UserModel user;

  const LoginResult({
    required this.token,
    required this.user,
  });
}

class RegisterResult {
  final UserModel user;
  final String? token;

  const RegisterResult({
    required this.user,
    this.token,
  });
}

String _messageFromDio(Object e) {
  if (e is DioException) {
    final data = e.response?.data;
    if (data is Map) {
      final m = data['message'];
      if (m is String && m.isNotEmpty) return m;
      final errs = data['errors'];
      if (errs is List && errs.isNotEmpty) return errs.first.toString();
      if (errs is String && errs.isNotEmpty) return errs;
    }
    if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.sendTimeout ||
        e.type == DioExceptionType.receiveTimeout) {
      return 'Request timed out. If the server was sleeping (e.g. Render free tier), try again.';
    }
    if (e.type == DioExceptionType.connectionError) {
      return 'Could not reach the server. Check your network and API base URL.';
    }
  }
  return e.toString();
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final ApiService _apiService;

  AuthRemoteDataSourceImpl(this._apiService);

  @override
  Future<RegisterResult> registerUser(Map<String, dynamic> userData) async {
    try {
      final response = await _apiService.post(
        ApiConstants.registerEndpoint,
        data: userData,
      );

      final body = response.data as Map<String, dynamic>;
      if (body['success'] != true) {
        throw Exception(body['message'] ?? 'Registration failed');
      }

      final data = body['data'] as Map<String, dynamic>;
      final userJson = data['user'] as Map<String, dynamic>;
      final token = data['token'] as String?;

      return RegisterResult(
        user: UserModel.fromJson(userJson),
        token: token,
      );
    } catch (e) {
      throw Exception(_messageFromDio(e));
    }
  }

  @override
  Future<LoginResult> loginUser({
    required String phone,
    required String password,
  }) async {
    try {
      final response = await _apiService.post(
        ApiConstants.loginEndpoint,
        data: {
          'phone': phone,
          'password': password,
        },
      );

      final body = response.data as Map<String, dynamic>;
      if (body['success'] != true) {
        throw Exception(body['message'] ?? 'Login failed');
      }

      final data = body['data'] as Map<String, dynamic>;
      return LoginResult(
        token: data['token'] as String,
        user: UserModel.fromJson(data['user'] as Map<String, dynamic>),
      );
    } catch (e) {
      throw Exception(_messageFromDio(e));
    }
  }

  @override
  Future<void> forgotPassword(String phone) async {
    try {
      final response = await _apiService.post(
        ApiConstants.forgotPasswordEndpoint,
        data: {
          'phone': phone,
        },
      );

      final body = response.data as Map<String, dynamic>;
      if (body['success'] != true) {
        throw Exception(body['message'] ?? 'Reset request failed');
      }
    } catch (e) {
      throw Exception(_messageFromDio(e));
    }
  }

  @override
  Future<UserModel> verifyToken(String token) async {
    try {
      final response = await _apiService.get(
        ApiConstants.verifyEndpoint,
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      final body = response.data as Map<String, dynamic>;
      if (body['success'] != true) {
        throw Exception(body['message'] ?? 'Token verification failed');
      }

      return UserModel.fromJson(body['data'] as Map<String, dynamic>);
    } catch (e) {
      throw Exception(_messageFromDio(e));
    }
  }

  @override
  Future<UserModel> getProfile(String token) async {
    try {
      final response = await _apiService.get(
        ApiConstants.profileEndpoint,
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      final body = response.data as Map<String, dynamic>;
      if (body['success'] != true) {
        throw Exception(body['message'] ?? 'Unable to load profile');
      }

      return UserModel.fromJson(body['data'] as Map<String, dynamic>);
    } catch (e) {
      throw Exception(_messageFromDio(e));
    }
  }

  @override
  Future<UserModel> updateProfile(String token, Map<String, dynamic> userData) async {
    try {
      final response = await _apiService.put(
        ApiConstants.profileEndpoint,
        data: userData,
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      final body = response.data as Map<String, dynamic>;
      if (body['success'] != true) {
        throw Exception(body['message'] ?? 'Updating profile failed');
      }

      return UserModel.fromJson(body['data'] as Map<String, dynamic>);
    } catch (e) {
      throw Exception(_messageFromDio(e));
    }
  }
}

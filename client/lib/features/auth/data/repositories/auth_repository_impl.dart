import 'package:shared_preferences/shared_preferences.dart';

import '../../domain/entities/user_entity.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_datasource.dart';
import '../../../../core/constants/app_constants.dart';

String _normalizePhone(String phone) {
  return phone.trim().replaceAll(RegExp(r'[\s\-\(\)]'), '').toLowerCase();
}

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource _remoteDataSource;
  final SharedPreferences _prefs;

  AuthRepositoryImpl({
    required SharedPreferences prefs,
    required AuthRemoteDataSource remoteDataSource,
  })  : _prefs = prefs,
        _remoteDataSource = remoteDataSource;

  String? _getToken() => _prefs.getString(AppConstants.tokenKey);

  Future<void> _setToken(String token) async {
    await _prefs.setString(AppConstants.tokenKey, token);
  }

  @override
  Future<UserEntity> registerUser({
    required String phone,
    required String password,
    required String name,
    DateTime? dob,
    String? birthTime,
    String? birthPlace,
  }) async {
    final normalized = _normalizePhone(phone);
    final userData = {
      'name': name,
      'phone': normalized,
      'password': password,
      if (dob != null) 'dob': dob.toIso8601String(),
      if (birthTime != null) 'birthTime': birthTime,
      if (birthPlace != null) 'birthPlace': birthPlace,
    };

    final result = await _remoteDataSource.registerUser(userData);
    final t = result.token;
    if (t != null && t.isNotEmpty) {
      await _setToken(t);
    }
    return result.user;
  }

  @override
  Future<UserEntity> loginUser(String phone, String password) async {
    final normalized = _normalizePhone(phone);
    final loginResult = await _remoteDataSource.loginUser(
      phone: normalized,
      password: password,
    );
    await _setToken(loginResult.token);
    return loginResult.user;
  }

  @override
  Future<void> sendPasswordResetEmail(String email) async {
    await _remoteDataSource.forgotPassword(_normalizePhone(email));
  }

  @override
  Future<void> logout() async {
    await _prefs.remove(AppConstants.tokenKey);
    await _prefs.remove(AppConstants.userKey);
  }

  @override
  Future<UserEntity> getProfile() async {
    final token = _getToken();
    if (token == null || token.isEmpty) {
      throw Exception('Not authenticated');
    }
    return _remoteDataSource.getProfile(token);
  }

  @override
  Future<UserEntity> updateProfile({
    String? name,
    DateTime? dob,
    String? birthTime,
    String? birthPlace,
    String? phone,
  }) async {
    final token = _getToken();
    if (token == null || token.isEmpty) {
      throw Exception('Not authenticated');
    }

    final userData = {
      if (name != null) 'name': name,
      if (dob != null) 'dob': dob.toIso8601String(),
      if (birthTime != null) 'birthTime': birthTime,
      if (birthPlace != null) 'birthPlace': birthPlace,
      if (phone != null) 'phone': _normalizePhone(phone),
    };

    return _remoteDataSource.updateProfile(token, userData);
  }

  @override
  Future<void> reloadUser() async {
    final token = _getToken();
    if (token == null || token.isEmpty) return;
    await _remoteDataSource.verifyToken(token);
  }

  @override
  String? getToken() => _getToken();
}

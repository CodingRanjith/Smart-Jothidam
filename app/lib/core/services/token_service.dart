import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_constants.dart';

class TokenService {
  final SharedPreferences _prefs;

  TokenService(this._prefs);

  // Save token
  Future<bool> saveToken(String token) async {
    try {
      return await _prefs.setString(AppConstants.tokenKey, token);
    } catch (e) {
      return false;
    }
  }

  // Get token
  String? getToken() {
    try {
      return _prefs.getString(AppConstants.tokenKey);
    } catch (e) {
      return null;
    }
  }

  // Delete token
  Future<bool> deleteToken() async {
    try {
      return await _prefs.remove(AppConstants.tokenKey);
    } catch (e) {
      return false;
    }
  }

  // Check if token exists
  bool hasToken() {
    return _prefs.containsKey(AppConstants.tokenKey);
  }
}

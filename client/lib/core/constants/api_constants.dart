class ApiConstants {
  /// Must include scheme (`http://` or `https://`). Plain `localhost:3000` breaks Dio / web XHR.
  // static String get baseUrl {
  //   if (kDebugMode) {
  //     return 'http://localhost:3000';
  //   }
  //   return 'https://smart-jothidam-backend.onrender.com';
  // }
  static const String baseUrl = 'https://smart-jothidam-backend.onrender.com';
    // static const String baseUrl = 'http://localhost:3000';


  // Legacy paths (no `/api` prefix). Production Render currently exposes these;
  // `/api/auth/...` etc. return 404 until the server is redeployed with `/api` mounts.
  static const String registerEndpoint = '/auth/register';
  static const String loginEndpoint = '/auth/login';
  static const String verifyEndpoint = '/auth/verify';
  static const String forgotPasswordEndpoint = '/auth/forgot-password';
  static const String resetPasswordEndpoint = '/auth/reset-password';
  static const String profileEndpoint = '/profile';

  // Josiyam — POST; full URL is [baseUrl] + path (Dio baseUrl is [baseUrl])
  static const String singleJosiyamEndpoint = '/josiyam/single';
  static const String coupleJosiyamEndpoint = '/josiyam/couple';
  static const String partnersEndpoint = '/partners';

  /// GET `/josiyam/result/:resultId` — reload saved result (JWT).
  static String josiyamResultEndpoint(String resultId) =>
      '/josiyam/result/$resultId';

  /// GET `/report/pdf` — premium PDF (JWT, optional premium gate on server).
  static const String reportPdfEndpoint = '/report/pdf';

  /// Client hint: set `true` when backend has `PREMIUM_GATE_ENABLED=true`.
  static const bool premiumGateEnabled = false;

  // Request timeout (Render free tier cold start can exceed 30s)
  static const Duration connectionTimeout = Duration(seconds: 90);
  static const Duration receiveTimeout = Duration(seconds: 90);
}


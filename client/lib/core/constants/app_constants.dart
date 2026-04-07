class AppConstants {
  // App info
  static const String appName = 'STJ';
  static const String appVersion = '1.0.0';
  
  // Validation
  static const int minNameLength = 2;
  static const int minPasswordLength = 8;
  
  // Storage keys
  static const String tokenKey = 'auth_token';
  static const String userKey = 'user_data';
  
  // Routes
  static const String splashRoute = '/';
  static const String welcomeRoute = '/welcome';
  static const String loginRoute = '/login';
  static const String registerRoute = '/register';
  static const String verifyEmailRoute = '/verify-email';
  static const String forgotPasswordRoute = '/forgot-password';
  static const String homeRoute = '/home';
  static const String profileRoute = '/profile';

  // Module 2 / 3 (Josiyam)
  static const String singleJosiyamRoute = '/single-josiyam';
  static const String coupleJosiyamRoute = '/couple-josiyam';
}

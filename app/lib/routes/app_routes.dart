import 'package:flutter/material.dart';
import '../core/constants/app_constants.dart';
import '../features/auth/presentation/pages/splash_page.dart';
import '../features/auth/presentation/pages/welcome_page.dart';
import '../features/auth/presentation/pages/login_page.dart';
import '../features/auth/presentation/pages/register_page.dart';
import '../features/auth/presentation/pages/verify_email_page.dart';
import '../features/auth/presentation/pages/forgot_password_page.dart';
import '../features/auth/presentation/pages/profile_page.dart';
import '../features/home/presentation/pages/home_page.dart';
import '../features/josiyam/presentation/pages/couple_josiyam_page.dart';
import '../features/josiyam/presentation/pages/single_josiyam_page.dart';

class AppRoutes {
  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case AppConstants.splashRoute:
        return MaterialPageRoute(builder: (_) => const SplashPage());
      
      case AppConstants.welcomeRoute:
        return MaterialPageRoute(builder: (_) => const WelcomePage());
      
      case AppConstants.loginRoute:
        return MaterialPageRoute(builder: (_) => const LoginPage());
      
      case AppConstants.registerRoute:
        return MaterialPageRoute(builder: (_) => const RegisterPage());
      
      case AppConstants.verifyEmailRoute:
        return MaterialPageRoute(builder: (_) => const VerifyEmailPage());
      
      case AppConstants.forgotPasswordRoute:
        return MaterialPageRoute(builder: (_) => const ForgotPasswordPage());
      
      case AppConstants.profileRoute:
        return MaterialPageRoute(builder: (_) => const ProfilePage());
      
      case AppConstants.homeRoute:
        return MaterialPageRoute(builder: (_) => const HomePage());

      case AppConstants.singleJosiyamRoute:
        final singleArgs = settings.arguments;
        String? singleRid;
        if (singleArgs is Map && singleArgs['resultId'] != null) {
          singleRid = singleArgs['resultId'].toString();
        }
        return MaterialPageRoute(
          builder: (_) => SingleJosiyamPage(resultId: singleRid),
        );

      case AppConstants.coupleJosiyamRoute:
        final coupleArgs = settings.arguments;
        String? coupleRid;
        if (coupleArgs is Map && coupleArgs['resultId'] != null) {
          coupleRid = coupleArgs['resultId'].toString();
        }
        return MaterialPageRoute(
          builder: (_) => CoupleJosiyamPage(resultId: coupleRid),
        );
      
      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(
              child: Text('No route defined for ${settings.name}'),
            ),
          ),
        );
    }
  }
}

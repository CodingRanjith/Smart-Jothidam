import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'app.dart';
import 'features/josiyam/domain/repositories/josiyam_repository.dart';
import 'features/josiyam/domain/usecases/get_stored_josiyam_result.dart';
import 'core/network/dio_client.dart';
import 'core/network/api_service.dart';
import 'features/auth/data/datasources/auth_remote_datasource.dart';
import 'features/auth/data/repositories/auth_repository_impl.dart';
import 'features/auth/domain/usecases/register_user.dart';
import 'features/auth/domain/usecases/login_user.dart';
import 'features/auth/domain/usecases/forgot_password.dart';
import 'features/auth/domain/usecases/get_profile.dart';
import 'features/auth/domain/usecases/update_profile.dart';
import 'features/auth/domain/usecases/logout_user.dart';
import 'features/auth/presentation/bloc/auth_bloc.dart';
import 'features/josiyam/data/datasources/josiyam_remote_datasource.dart';
import 'features/josiyam/data/repositories/josiyam_repository_impl.dart';
import 'features/josiyam/domain/usecases/get_couple_josiyam.dart';
import 'features/josiyam/domain/usecases/get_single_josiyam.dart';
import 'features/josiyam/domain/usecases/list_partner_profiles.dart';
import 'features/josiyam/presentation/bloc/couple_josiyam_bloc.dart';
import 'features/josiyam/presentation/bloc/josiyam_bloc.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final sharedPreferences = await SharedPreferences.getInstance();

  runApp(MyAppWithDependencies(sharedPreferences: sharedPreferences));
}

class MyAppWithDependencies extends StatelessWidget {
  final SharedPreferences sharedPreferences;

  const MyAppWithDependencies({
    super.key,
    required this.sharedPreferences,
  });

  @override
  Widget build(BuildContext context) {
    final dioClient = DioClient();
    final apiService = ApiService(dioClient);

    final authRemoteDataSource = AuthRemoteDataSourceImpl(apiService);

    final authRepository = AuthRepositoryImpl(
      prefs: sharedPreferences,
      remoteDataSource: authRemoteDataSource,
    );

    final registerUser = RegisterUser(authRepository);
    final loginUser = LoginUser(authRepository);
    final forgotPassword = ForgotPassword(authRepository);
    final getProfile = GetProfile(authRepository);
    final updateProfile = UpdateProfile(authRepository);
    final logoutUser = LogoutUser(authRepository);

    final josiyamRepository = JosiyamRepositoryImpl(
      prefs: sharedPreferences,
      remoteDataSource: JosiyamRemoteDataSourceImpl(apiService),
    );

    final getStoredJosiyamResult = GetStoredJosiyamResult(josiyamRepository);

    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider<JosiyamRepository>.value(value: josiyamRepository),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider(
            create: (context) => AuthBloc(
              authRepository: authRepository,
              registerUser: registerUser,
              loginUser: loginUser,
              forgotPassword: forgotPassword,
              getProfile: getProfile,
              updateProfile: updateProfile,
              logoutUser: logoutUser,
            ),
          ),
          BlocProvider(
            create: (context) => JosiyamBloc(
              getSingleJosiyam: GetSingleJosiyam(josiyamRepository),
              getStoredJosiyamResult: getStoredJosiyamResult,
            ),
          ),
          BlocProvider(
            create: (context) => CoupleJosiyamBloc(
              listPartnerProfiles: ListPartnerProfiles(josiyamRepository),
              getCoupleJosiyam: GetCoupleJosiyam(josiyamRepository),
              getStoredJosiyamResult: getStoredJosiyamResult,
            ),
          ),
        ],
        child: const MyApp(),
      ),
    );
  }
}

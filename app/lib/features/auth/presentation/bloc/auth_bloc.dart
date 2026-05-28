import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/usecases/register_user.dart';
import '../../domain/usecases/login_user.dart';
import '../../domain/usecases/forgot_password.dart';
import '../../domain/usecases/get_profile.dart';
import '../../domain/usecases/update_profile.dart';
import '../../domain/usecases/logout_user.dart';
import 'auth_event.dart';
import 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository _authRepository;
  final RegisterUser _registerUser;
  final LoginUser _loginUser;
  final ForgotPassword _forgotPassword;
  final GetProfile _getProfile;
  final UpdateProfile _updateProfile;
  final LogoutUser _logoutUser;

  AuthBloc({
    required AuthRepository authRepository,
    required RegisterUser registerUser,
    required LoginUser loginUser,
    required ForgotPassword forgotPassword,
    required GetProfile getProfile,
    required UpdateProfile updateProfile,
    required LogoutUser logoutUser,
  })  : _authRepository = authRepository,
        _registerUser = registerUser,
        _loginUser = loginUser,
        _forgotPassword = forgotPassword,
        _getProfile = getProfile,
        _updateProfile = updateProfile,
        _logoutUser = logoutUser,
        super(AuthInitial()) {
    on<AuthCheckRequested>(_onAuthCheckRequested);
    on<AuthRegisterRequested>(_onAuthRegisterRequested);
    on<AuthLoginRequested>(_onAuthLoginRequested);
    on<AuthLogoutRequested>(_onAuthLogoutRequested);
    on<AuthForgotPasswordRequested>(_onAuthForgotPasswordRequested);
    on<AuthGetProfileRequested>(_onAuthGetProfileRequested);
    on<AuthUpdateProfileRequested>(_onAuthUpdateProfileRequested);
  }

  Future<void> _onAuthCheckRequested(
    AuthCheckRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      final user = await _getProfile();
      emit(AuthAuthenticated(user: user, token: _authRepository.getToken()));
    } catch (e) {
      emit(AuthUnauthenticated());
    }
  }

  Future<void> _onAuthRegisterRequested(
    AuthRegisterRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      final user = await _registerUser(
        phone: event.phone,
        password: event.password,
        name: event.name,
        dob: event.dob,
        birthTime: event.birthTime,
        birthPlace: event.birthPlace,
      );
      emit(AuthAuthenticated(user: user, token: _authRepository.getToken()));
    } catch (e) {
      emit(AuthError(message: e.toString()));
    }
  }

  Future<void> _onAuthLoginRequested(
    AuthLoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      final user = await _loginUser(event.phone, event.password);
      emit(AuthAuthenticated(user: user, token: _authRepository.getToken()));
    } catch (e) {
      emit(AuthError(message: e.toString()));
    }
  }

  Future<void> _onAuthLogoutRequested(
    AuthLogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      await _logoutUser();
      emit(AuthUnauthenticated());
    } catch (e) {
      emit(AuthError(message: e.toString()));
    }
  }

  Future<void> _onAuthForgotPasswordRequested(
    AuthForgotPasswordRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      await _forgotPassword(event.email);
      emit(AuthPasswordResetEmailSent());
    } catch (e) {
      emit(AuthError(message: e.toString()));
    }
  }

  Future<void> _onAuthGetProfileRequested(
    AuthGetProfileRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      final user = await _getProfile();
      emit(AuthAuthenticated(user: user, token: _authRepository.getToken()));
    } catch (e) {
      emit(AuthError(message: e.toString()));
    }
  }

  Future<void> _onAuthUpdateProfileRequested(
    AuthUpdateProfileRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      final user = await _updateProfile(
        name: event.name,
        dob: event.dob,
        birthTime: event.birthTime,
        birthPlace: event.birthPlace,
        phone: event.phone,
      );
      emit(AuthAuthenticated(user: user, token: _authRepository.getToken()));
    } catch (e) {
      emit(AuthError(message: e.toString()));
    }
  }
}

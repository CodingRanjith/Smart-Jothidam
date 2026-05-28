import 'package:equatable/equatable.dart';

abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object?> get props => [];
}

class AuthCheckRequested extends AuthEvent {}

class AuthRegisterRequested extends AuthEvent {
  final String phone;
  final String password;
  final String name;
  final DateTime? dob;
  final String? birthTime;
  final String? birthPlace;

  const AuthRegisterRequested({
    required this.phone,
    required this.password,
    required this.name,
    this.dob,
    this.birthTime,
    this.birthPlace,
  });

  @override
  List<Object?> get props => [phone, password, name, dob, birthTime, birthPlace];
}

class AuthLoginRequested extends AuthEvent {
  final String phone;
  final String password;

  const AuthLoginRequested({
    required this.phone,
    required this.password,
  });

  @override
  List<Object?> get props => [phone, password];
}

class AuthLogoutRequested extends AuthEvent {}

class AuthForgotPasswordRequested extends AuthEvent {
  final String email;

  const AuthForgotPasswordRequested({required this.email});

  @override
  List<Object?> get props => [email];
}

class AuthGetProfileRequested extends AuthEvent {}

class AuthUpdateProfileRequested extends AuthEvent {
  final String? name;
  final DateTime? dob;
  final String? birthTime;
  final String? birthPlace;
  final String? phone;

  const AuthUpdateProfileRequested({
    this.name,
    this.dob,
    this.birthTime,
    this.birthPlace,
    this.phone,
  });

  @override
  List<Object?> get props => [name, dob, birthTime, birthPlace, phone];
}

import '../../features/auth/domain/entities/user_entity.dart';

/// Matches backend `TIME_HHMM_RE`: 24h `HH:mm`.
final RegExp josiyamBirthTimePattern =
    RegExp(r'^([01][0-9]|2[0-3]):([0-5][0-9])$');

/// Birth data required for single-person Josiyam from the saved profile
/// (date of birth, valid `HH:mm` time, non-empty place).
bool isJosiyamProfileComplete(UserEntity user) {
  final time = user.birthTime?.trim() ?? '';
  final place = user.birthPlace?.trim() ?? '';
  if (user.dob == null || time.isEmpty || place.isEmpty) return false;
  return josiyamBirthTimePattern.hasMatch(time);
}

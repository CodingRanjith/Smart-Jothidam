import 'package:intl/intl.dart';

class AppDateUtils {
  // Format date to string
  static String formatDate(DateTime date, {String format = 'yyyy-MM-dd'}) {
    return DateFormat(format).format(date);
  }

  // Format time to string
  static String formatTime(DateTime time, {String format = 'HH:mm'}) {
    return DateFormat(format).format(time);
  }

  // Parse string to date
  static DateTime? parseDate(String dateString, {String format = 'yyyy-MM-dd'}) {
    try {
      return DateFormat(format).parse(dateString);
    } catch (e) {
      return null;
    }
  }

  // Parse string to time
  static DateTime? parseTime(String timeString, {String format = 'HH:mm'}) {
    try {
      return DateFormat(format).parse(timeString);
    } catch (e) {
      return null;
    }
  }

  // Convert DateTime to ISO string
  static String toIsoString(DateTime date) {
    return date.toIso8601String();
  }

  // Convert ISO string to DateTime
  static DateTime? fromIsoString(String isoString) {
    try {
      return DateTime.parse(isoString);
    } catch (e) {
      return null;
    }
  }
}

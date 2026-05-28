class CountryCode {
  final String code;
  final String name;
  final String dialCode;
  final String flag;

  const CountryCode({
    required this.code,
    required this.name,
    required this.dialCode,
    required this.flag,
  });

  static const List<CountryCode> _countries = [
    CountryCode(code: 'IN', name: 'India', dialCode: '+91', flag: 'IN'),
    CountryCode(code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: 'BD'),
    CountryCode(code: 'LK', name: 'Sri Lanka', dialCode: '+94', flag: 'LK'),
    CountryCode(code: 'NP', name: 'Nepal', dialCode: '+977', flag: 'NP'),
    CountryCode(code: 'PK', name: 'Pakistan', dialCode: '+92', flag: 'PK'),
    CountryCode(code: 'US', name: 'United States', dialCode: '+1', flag: 'US'),
    CountryCode(code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: 'GB'),
    CountryCode(code: 'CA', name: 'Canada', dialCode: '+1', flag: 'CA'),
    CountryCode(code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: 'AE'),
    CountryCode(code: 'AU', name: 'Australia', dialCode: '+61', flag: 'AU'),
  ];

  static List<CountryCode> getAllCountries() => List<CountryCode>.from(_countries);
}

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart';
import '../widgets/auth_textfield.dart';
import '../widgets/auth_button.dart';
import '../../data/models/country_code.dart';
import '../widgets/country_code_picker.dart';
import '../../../../core/utils/validators.dart';
import '../../../../core/constants/app_constants.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _phoneController = TextEditingController();
  CountryCode _selectedCountry = CountryCode.getAllCountries().first;

  DateTime? _selectedDob;
  TimeOfDay? _selectedBirthTime;
  final _birthPlaceController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _phoneController.dispose();
    _birthPlaceController.dispose();
    super.dispose();
  }

  void _onRegisterPressed() {
    if (_formKey.currentState!.validate()) {
      String? birthTimeString;
      if (_selectedBirthTime != null) {
        birthTimeString = '${_selectedBirthTime!.hour.toString().padLeft(2, '0')}:${_selectedBirthTime!.minute.toString().padLeft(2, '0')}';
      }
      final fullPhone = '${_selectedCountry.dialCode}${_phoneController.text.trim()}';

      context.read<AuthBloc>().add(
            AuthRegisterRequested(
              name: _nameController.text.trim(),
              phone: fullPhone,
              password: _passwordController.text,
              dob: _selectedDob,
              birthTime: birthTimeString,
              birthPlace: _birthPlaceController.text.trim().isNotEmpty ? _birthPlaceController.text.trim() : null,
            ),
          );
    }
  }

  String _formatDate(DateTime date) {
    final day = date.day.toString().padLeft(2, '0');
    final month = date.month.toString().padLeft(2, '0');
    final year = date.year.toString();
    return '$day/$month/$year';
  }

  InputDecoration _inputDecoration({
    required String hint,
    Widget? suffixIcon,
    Widget? prefixIcon,
  }) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(
        color: Color(0xFF8C8993),
        fontSize: 14,
      ),
      filled: true,
      fillColor: const Color(0xFFF3F1F6),
      prefixIcon: prefixIcon,
      suffixIcon: suffixIcon,
      contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(28),
        borderSide: BorderSide.none,
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(28),
        borderSide: const BorderSide(color: Color(0xFF8E164F), width: 1.2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(28),
        borderSide: const BorderSide(color: Colors.redAccent),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(28),
        borderSide: const BorderSide(color: Colors.redAccent, width: 1.2),
      ),
    );
  }

  Widget _sectionLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w500,
          color: Color(0xFF1E1B24),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFEAE8EE),
      body: SafeArea(
        child: BlocConsumer<AuthBloc, AuthState>(
          listener: (context, state) {
            if (state is AuthAuthenticated) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Account created. You are signed in.')),
              );
              Navigator.pushReplacementNamed(context, AppConstants.homeRoute);
            } else if (state is AuthSuccess) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(state.message)),
              );
            } else if (state is AuthError) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(state.message)),
              );
            }
          },
          builder: (context, state) {
            return SingleChildScrollView(
              child: Form(
                key: _formKey,
                child: Column(
                  children: [
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.fromLTRB(24, 28, 24, 74),
                      decoration: const BoxDecoration(
                        color: Color(0xFF3B0521),
                        borderRadius: BorderRadius.only(
                          bottomLeft: Radius.circular(30),
                          bottomRight: Radius.circular(30),
                        ),
                      ),
                      child: const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Get Started Now',
                            style: TextStyle(
                              fontSize: 31,
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                            ),
                          ),
                          SizedBox(height: 8),
                          Text(
                            'Create an account or log in to explore\nabout our app',
                            style: TextStyle(
                              fontSize: 15,
                              color: Color(0xFFE7DBE2),
                              height: 1.35,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Transform.translate(
                      offset: const Offset(0, -44),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(18, 20, 18, 24),
                          decoration: BoxDecoration(
                            color: const Color(0xFFEDEAF2),
                            borderRadius: BorderRadius.circular(30),
                            boxShadow: const [
                              BoxShadow(
                                color: Color(0x22000000),
                                blurRadius: 18,
                                offset: Offset(0, 8),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              _sectionLabel('Name'),
                              TextFormField(
                                controller: _nameController,
                                validator: Validators.validateName,
                                decoration: _inputDecoration(hint: 'Koushik Sarkar'),
                              ),
                              const SizedBox(height: 14),
                              _sectionLabel('Phone'),
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  CountryCodePicker(
                                    borderRadius: 28,
                                    height: 54,
                                    width: 112,
                                    backgroundColor: const Color(0xFFF3F1F6),
                                    borderColor: const Color(0xFFE0D8E4),
                                    selectedCountry: _selectedCountry,
                                    onChanged: (country) {
                                      setState(() {
                                        _selectedCountry = country;
                                      });
                                    },
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: TextFormField(
                                      controller: _phoneController,
                                      validator: Validators.validateRequiredPhone,
                                      keyboardType: TextInputType.phone,
                                      decoration: _inputDecoration(hint: '98765 43210'),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 14),
                              _sectionLabel('Birth of date'),
                              InkWell(
                                onTap: () async {
                                  final date = await showDatePicker(
                                    context: context,
                                    initialDate: _selectedDob ?? DateTime.now().subtract(const Duration(days: 365 * 20)),
                                    firstDate: DateTime(1900),
                                    lastDate: DateTime.now(),
                                  );
                                  if (date != null) {
                                    setState(() => _selectedDob = date);
                                  }
                                },
                                borderRadius: BorderRadius.circular(28),
                                child: IgnorePointer(
                                  child: TextFormField(
                                    controller: TextEditingController(
                                      text: _selectedDob == null ? '' : _formatDate(_selectedDob!),
                                    ),
                                    decoration: _inputDecoration(
                                      hint: '15/06/2000',
                                      suffixIcon: const Icon(Icons.calendar_today_outlined, size: 18),
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 14),
                              _sectionLabel('Set Password'),
                              TextFormField(
                                controller: _passwordController,
                                validator: Validators.validatePassword,
                                obscureText: true,
                                decoration: _inputDecoration(
                                  hint: '******',
                                  suffixIcon: const Icon(Icons.visibility_off_outlined, size: 18),
                                ),
                              ),
                              const SizedBox(height: 14),
                              _sectionLabel('Confirm Password'),
                              TextFormField(
                                controller: _confirmPasswordController,
                                validator: (value) => Validators.validateConfirmPassword(value, _passwordController.text),
                                obscureText: true,
                                decoration: _inputDecoration(
                                  hint: '******',
                                  suffixIcon: const Icon(Icons.visibility_off_outlined, size: 18),
                                ),
                              ),
                              const SizedBox(height: 14),
                              _sectionLabel('Birth Time (optional)'),
                              InkWell(
                                onTap: () async {
                                  final time = await showTimePicker(
                                    context: context,
                                    initialTime: _selectedBirthTime ?? TimeOfDay.now(),
                                  );
                                  if (time != null) {
                                    setState(() => _selectedBirthTime = time);
                                  }
                                },
                                borderRadius: BorderRadius.circular(28),
                                child: IgnorePointer(
                                  child: TextFormField(
                                    controller: TextEditingController(
                                      text: _selectedBirthTime == null ? '' : _selectedBirthTime!.format(context),
                                    ),
                                    decoration: _inputDecoration(
                                      hint: '10:30 AM',
                                      suffixIcon: const Icon(Icons.access_time_outlined, size: 18),
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 14),
                              _sectionLabel('Birth Place (optional)'),
                              TextFormField(
                                controller: _birthPlaceController,
                                decoration: _inputDecoration(hint: 'Kolkata'),
                              ),
                              const SizedBox(height: 24),
                              SizedBox(
                                height: 54,
                                child: ElevatedButton(
                                  onPressed: state is AuthLoading ? null : _onRegisterPressed,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF9E1B5B),
                                    foregroundColor: Colors.white,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(28),
                                    ),
                                    elevation: 0,
                                  ),
                                  child: state is AuthLoading
                                      ? const SizedBox(
                                          width: 20,
                                          height: 20,
                                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                        )
                                      : const Text(
                                          'Sign Up',
                                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                                        ),
                                ),
                              ),
                              const SizedBox(height: 14),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Text(
                                    'Already have an account? ',
                                    style: TextStyle(color: Color(0xFF4F4A5A)),
                                  ),
                                  TextButton(
                                    onPressed: () {
                                      Navigator.pushReplacementNamed(context, AppConstants.loginRoute);
                                    },
                                    child: const Text(
                                      'Log in',
                                      style: TextStyle(fontWeight: FontWeight.w600),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

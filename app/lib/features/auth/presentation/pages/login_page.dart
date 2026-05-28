import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart';
import '../../../../core/utils/validators.dart';
import '../../../../core/constants/app_constants.dart';
import '../../data/models/country_code.dart';
import '../widgets/country_code_picker.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  static const double _phoneRowRadius = 12;
  static const double _phoneRowHeight = 52;
  static const Color _phoneFill = Color(0xFFF5F3F7);
  static const Color _phoneBorder = Color(0xFFE0D8E4);
  static const Color _phoneFocusBorder = Color(0xFFB41C63);

  final _formKey = GlobalKey<FormState>();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _phoneFocusNode = FocusNode();
  CountryCode _selectedCountry = CountryCode.getAllCountries().first;
  bool _obscurePassword = true;
  bool _rememberMe = false;

  @override
  void dispose() {
    _phoneFocusNode.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _onLoginPressed() {
    if (_formKey.currentState!.validate()) {
      final fullPhone = '${_selectedCountry.dialCode}${_phoneController.text.trim()}';
      context.read<AuthBloc>().add(
            AuthLoginRequested(
              phone: fullPhone,
              password: _passwordController.text,
            ),
          );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1EEF5),
      body: BlocConsumer<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is AuthAuthenticated) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Login successful')),
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
          return SafeArea(
            top: false,
            child: SingleChildScrollView(
              child: Column(
                children: [
                  _buildTopHeader(),
                  Transform.translate(
                    offset: const Offset(0, -14),
                    child: _buildFormCard(context, state is AuthLoading),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildTopHeader() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(24, 52, 24, 110),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF2A0622), Color(0xFF6A0F38)],
        ),
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(36),
          bottomRight: Radius.circular(36),
        ),
      ),
      child: Stack(
        children: [
          Positioned(
            left: -72,
            top: -48,
            child: Container(
              height: 220,
              width: 220,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.06),
                shape: BoxShape.circle,
              ),
            ),
          ),
          Positioned(
            right: -56,
            top: 48,
            child: Container(
              height: 170,
              width: 170,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.05),
                shape: BoxShape.circle,
              ),
            ),
          ),
          const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(height: 54),
              Text(
                'Sign in to your Account',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 33,
                  fontWeight: FontWeight.w700,
                ),
              ),
              SizedBox(height: 10),
              Text(
                'Sign in-up to enjoy the best managing\nexperience',
                style: TextStyle(
                  color: Color(0xFFE7DCE5),
                  fontSize: 14,
                  height: 1.35,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFormCard(BuildContext context, bool isLoading) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(22, 22, 22, 26),
      decoration: const BoxDecoration(
        color: Color(0xFFF1EEF5),
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(34),
          topRight: Radius.circular(34),
        ),
      ),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _fieldLabel('Phone Number'),
            const SizedBox(height: 8),
            _buildPhoneRow(),
            const SizedBox(height: 16),
            _fieldLabel('Password'),
            const SizedBox(height: 8),
            _buildInputField(
              controller: _passwordController,
              hintText: '******',
              obscureText: _obscurePassword,
              validator: Validators.validatePassword,
              suffix: IconButton(
                onPressed: () {
                  setState(() {
                    _obscurePassword = !_obscurePassword;
                  });
                },
                icon: Icon(
                  _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                  color: const Color(0xFF8C8792),
                  size: 20,
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                SizedBox(
                  height: 20,
                  width: 20,
                  child: Checkbox(
                    value: _rememberMe,
                    onChanged: (value) {
                      setState(() {
                        _rememberMe = value ?? false;
                      });
                    },
                    side: const BorderSide(color: Color(0xFF867F8E), width: 1.2),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                    activeColor: const Color(0xFFB41C63),
                    materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                ),
                const SizedBox(width: 8),
                const Text(
                  'Remember me',
                  style: TextStyle(color: Color(0xFF3B3642), fontSize: 15),
                ),
                const Spacer(),
                TextButton(
                  onPressed: () {
                    Navigator.pushNamed(context, AppConstants.forgotPasswordRoute);
                  },
                  style: TextButton.styleFrom(
                    foregroundColor: const Color(0xFFB41C63),
                    padding: EdgeInsets.zero,
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  child: const Text(
                    'Forget password?',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w500),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),
            SizedBox(
              width: double.infinity,
              height: 54,
              child: ElevatedButton(
                onPressed: isLoading ? null : _onLoginPressed,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFB41C63),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(32),
                  ),
                  elevation: 0,
                ),
                child: isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2.2),
                      )
                    : const Text(
                        'Log In',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                      ),
              ),
            ),
            const SizedBox(height: 18),
            const Center(
              child: Text(
                'Or',
                style: TextStyle(color: Color(0xFF5C5763), fontSize: 16),
              ),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.78),
                borderRadius: BorderRadius.circular(28),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: _buildSocialButton(
                      onTap: () {},
                      icon: Icons.circle,
                      iconColor: Colors.transparent,
                      text: 'Google',
                      customIcon: const Text(
                        'G',
                        style: TextStyle(
                          color: Color(0xFFEA4335),
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: _buildSocialButton(
                      onTap: () {},
                      icon: Icons.facebook,
                      iconColor: const Color(0xFF1877F2),
                      text: 'Facebook',
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  "Don't have an account? ",
                  style: TextStyle(color: Color(0xFF757080), fontSize: 15),
                ),
                TextButton(
                  onPressed: () {
                    Navigator.pushReplacementNamed(context, AppConstants.registerRoute);
                  },
                  style: TextButton.styleFrom(
                    foregroundColor: const Color(0xFFB41C63),
                    padding: EdgeInsets.zero,
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  child: const Text(
                    'Sign Up',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _fieldLabel(String text) {
    return Text(
      text,
      style: const TextStyle(
        color: Color(0xFF2F2A34),
        fontSize: 19,
        fontWeight: FontWeight.w600,
      ),
    );
  }

  Widget _buildPhoneRow() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        CountryCodePicker(
          borderRadius: _phoneRowRadius,
          height: _phoneRowHeight,
          width: 110,
          backgroundColor: _phoneFill,
          borderColor: _phoneBorder,
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
            focusNode: _phoneFocusNode,
            keyboardType: TextInputType.phone,
            validator: Validators.validateRequiredPhone,
            textAlignVertical: TextAlignVertical.center,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
              color: Color(0xFF2F2A34),
            ),
            decoration: InputDecoration(
              hintText: '9876543210',
              hintStyle: const TextStyle(color: Color(0xFF8A8591), fontSize: 16),
              filled: true,
              fillColor: _phoneFill,
              constraints: const BoxConstraints(minHeight: _phoneRowHeight),
              contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
              isDense: true,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(_phoneRowRadius),
                borderSide: BorderSide.none,
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(_phoneRowRadius),
                borderSide: const BorderSide(color: _phoneBorder, width: 1),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(_phoneRowRadius),
                borderSide: const BorderSide(color: _phoneFocusBorder, width: 2),
              ),
              errorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(_phoneRowRadius),
                borderSide: BorderSide(color: Colors.red.shade400),
              ),
              focusedErrorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(_phoneRowRadius),
                borderSide: BorderSide(color: Colors.red.shade700, width: 2),
              ),
              errorStyle: const TextStyle(height: 0.8),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildInputField({
    required TextEditingController controller,
    required String hintText,
    TextInputType keyboardType = TextInputType.text,
    bool obscureText = false,
    Widget? suffix,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      obscureText: obscureText,
      validator: validator,
      decoration: InputDecoration(
        hintText: hintText,
        hintStyle: const TextStyle(color: Color(0xFF8A8591), fontSize: 16),
        filled: true,
        fillColor: Colors.white.withValues(alpha: 0.85),
        contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(24),
          borderSide: BorderSide.none,
        ),
        errorStyle: const TextStyle(height: 0.8),
        suffixIcon: suffix,
      ),
    );
  }

  Widget _buildSocialButton({
    required VoidCallback onTap,
    required IconData icon,
    required Color iconColor,
    required String text,
    Widget? customIcon,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(24),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 6),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            customIcon ?? Icon(icon, color: iconColor, size: 24),
            const SizedBox(width: 6),
            Text(
              text,
              style: const TextStyle(
                color: Color(0xFF2F2A34),
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

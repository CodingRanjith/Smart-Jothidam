import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart';
import '../../../../core/utils/validators.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _birthPlaceController = TextEditingController();

  DateTime? _selectedDob;
  TimeOfDay? _selectedBirthTime;
  bool _timeUnknown = false;
  int _currentStep = 0;
  int? _selectedSex;
  bool _isInitialDataLoaded = false;
  static const List<String> _sexOptions = ['Male', 'Female'];

  /// True after "Update Profile" is dispatched; used to show success snackbar without emitting [AuthSuccess] (which would replace [AuthAuthenticated] and leave the page stuck on the loading indicator).
  bool _pendingUpdateSuccessSnack = false;

  @override
  void initState() {
    super.initState();
    context.read<AuthBloc>().add(AuthGetProfileRequested());
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _birthPlaceController.dispose();
    super.dispose();
  }

  void _onUpdatePressed() {
    if (_formKey.currentState!.validate()) {
      String? birthTimeString;
      if (_selectedBirthTime != null && !_timeUnknown) {
        birthTimeString = '${_selectedBirthTime!.hour.toString().padLeft(2, '0')}:${_selectedBirthTime!.minute.toString().padLeft(2, '0')}';
      }

      setState(() => _pendingUpdateSuccessSnack = true);
      context.read<AuthBloc>().add(
            AuthUpdateProfileRequested(
              name: _nameController.text.trim(),
              dob: _selectedDob,
              birthTime: birthTimeString,
              birthPlace: _birthPlaceController.text.trim().isNotEmpty ? _birthPlaceController.text.trim() : null,
              phone: _phoneController.text.trim().isNotEmpty ? _phoneController.text.trim() : null,
            ),
          );
    }
  }

  String _formatDob(DateTime? value) {
    if (value == null) {
      return '';
    }
    const months = <String>[
      'Jan.',
      'Feb.',
      'Mar.',
      'Apr.',
      'May',
      'Jun.',
      'Jul.',
      'Aug.',
      'Sep.',
      'Oct.',
      'Nov.',
      'Dec.',
    ];
    final month = months[value.month - 1];
    final day = value.day.toString().padLeft(2, '0');
    return '$month $day, ${value.year}.';
  }

  Future<void> _pickDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _selectedDob ?? DateTime.now().subtract(const Duration(days: 365 * 20)),
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
    );
    if (date != null) {
      setState(() => _selectedDob = date);
    }
  }

  Future<void> _pickTime() async {
    final time = await showTimePicker(
      context: context,
      initialTime: _selectedBirthTime ?? const TimeOfDay(hour: 0, minute: 0),
    );
    if (time != null) {
      setState(() {
        _selectedBirthTime = time;
        _timeUnknown = false;
      });
    }
  }

  InputDecoration _lineInputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      border: InputBorder.none,
      contentPadding: EdgeInsets.zero,
      isDense: true,
    );
  }

  Widget _sectionTitle(String text) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 28,
        fontWeight: FontWeight.w700,
        color: Colors.black87,
      ),
    );
  }

  Widget _progressHeader() {
    return Row(
      children: [
        IconButton(
          onPressed: () => Navigator.pop(context),
          icon: const Icon(Icons.close, color: Colors.black87),
        ),
        Expanded(
          child: Row(
            children: List.generate(
              3,
              (index) => Expanded(
                child: Container(
                  height: 4,
                  margin: EdgeInsets.only(right: index == 2 ? 0 : 8),
                  decoration: BoxDecoration(
                    color: index <= _currentStep ? Colors.black87 : Colors.black12,
                    borderRadius: BorderRadius.circular(99),
                  ),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Text(
          '${_currentStep + 1} / 3',
          style: const TextStyle(
            fontWeight: FontWeight.w600,
            color: Colors.black87,
          ),
        ),
      ],
    );
  }

  Widget _stepOne() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionTitle('When\'s your birthday?'),
        const SizedBox(height: 14),
        InkWell(
          onTap: _pickDate,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Text(
              _selectedDob == null ? 'Select your date of birth' : _formatDob(_selectedDob),
              style: TextStyle(
                fontSize: 24,
                color: _selectedDob == null ? Colors.black45 : Colors.black87,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ),
        const Divider(height: 24, thickness: 1),
        const SizedBox(height: 24),
        _sectionTitle('What time were you born?'),
        const SizedBox(height: 14),
        Row(
          children: [
            Expanded(
              child: InkWell(
                onTap: _timeUnknown ? null : _pickTime,
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Text(
                    _timeUnknown
                        ? '--:--'
                        : (_selectedBirthTime == null ? '12:00 AM' : _selectedBirthTime!.format(context)),
                    style: TextStyle(
                      fontSize: 24,
                      color: _timeUnknown ? Colors.black38 : Colors.black87,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ),
            ),
            Row(
              children: [
                Checkbox(
                  value: _timeUnknown,
                  side: const BorderSide(color: Colors.black26),
                  onChanged: (value) {
                    setState(() {
                      _timeUnknown = value ?? false;
                      if (_timeUnknown) {
                        _selectedBirthTime = null;
                      }
                    });
                  },
                ),
                const Text('I don\'t know'),
              ],
            ),
          ],
        ),
        const Divider(height: 24, thickness: 1),
        const SizedBox(height: 8),
        TextButton(
          onPressed: () {},
          child: const Text(
            'Why is this necessary',
            style: TextStyle(color: Colors.black45),
          ),
        ),
      ],
    );
  }

  Widget _stepTwo() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionTitle('What should we call you?'),
        const SizedBox(height: 14),
        TextFormField(
          controller: _nameController,
          validator: Validators.validateName,
          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w500),
          decoration: _lineInputDecoration('max 20 characters'),
        ),
        const Divider(height: 24, thickness: 1),
        const SizedBox(height: 24),
        _sectionTitle('What\'s your sex?'),
        const SizedBox(height: 16),
        Row(
          children: List.generate(_sexOptions.length, (index) {
            final selected = _selectedSex == index;
            return Expanded(
              child: Padding(
                padding: EdgeInsets.only(right: index == _sexOptions.length - 1 ? 0 : 10),
                child: OutlinedButton(
                  onPressed: () => setState(() => _selectedSex = index),
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: selected ? Colors.black87 : Colors.black26),
                    minimumSize: const Size.fromHeight(56),
                  ),
                  child: Text(
                    _sexOptions[index],
                    style: TextStyle(
                      color: Colors.black87,
                      fontWeight: selected ? FontWeight.w700 : FontWeight.w400,
                    ),
                  ),
                ),
              ),
            );
          }),
        ),
        const SizedBox(height: 8),
        TextButton(
          onPressed: () {},
          child: const Text(
            'Why is this necessary',
            style: TextStyle(color: Colors.black45),
          ),
        ),
      ],
    );
  }

  Widget _stepThree() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionTitle('A few more details'),
        const SizedBox(height: 22),
        const Text(
          'Phone',
          style: TextStyle(fontSize: 14, color: Colors.black54),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: _phoneController,
          keyboardType: TextInputType.phone,
          validator: Validators.validatePhone,
          decoration: _lineInputDecoration('Enter phone number'),
          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w500),
        ),
        const Divider(height: 24, thickness: 1),
        const SizedBox(height: 16),
        const Text(
          'Birth Place',
          style: TextStyle(fontSize: 14, color: Colors.black54),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: _birthPlaceController,
          decoration: _lineInputDecoration('Where were you born?'),
          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w500),
        ),
        const Divider(height: 24, thickness: 1),
      ],
    );
  }

  Widget _stepContent() {
    switch (_currentStep) {
      case 0:
        return _stepOne();
      case 1:
        return _stepTwo();
      default:
        return _stepThree();
    }
  }

  bool _validateCurrentStep() {
    if (_currentStep == 0) {
      return _selectedDob != null;
    }
    if (_currentStep == 1) {
      final validName = Validators.validateName(_nameController.text.trim()) == null;
      return validName && _selectedSex != null;
    }
    return _formKey.currentState?.validate() ?? false;
  }

  void _handleNext() {
    if (!_validateCurrentStep()) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please complete required fields before continuing.')),
      );
      return;
    }

    if (_currentStep < 2) {
      setState(() => _currentStep += 1);
      return;
    }
    _onUpdatePressed();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              context.read<AuthBloc>().add(AuthLogoutRequested());
            },
          ),
        ],
      ),
      body: BlocConsumer<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is AuthAuthenticated && _pendingUpdateSuccessSnack) {
            _pendingUpdateSuccessSnack = false;
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Profile updated successfully')),
            );
          } else if (state is AuthSuccess) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(state.message)),
            );
          } else if (state is AuthError) {
            if (_pendingUpdateSuccessSnack) {
              _pendingUpdateSuccessSnack = false;
            }
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(state.message)),
            );
          } else if (state is AuthUnauthenticated) {
            Navigator.pushReplacementNamed(context, '/login');
          }
        },
        builder: (context, state) {
          if (state is AuthError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      state.message,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    FilledButton(
                      onPressed: () {
                        context.read<AuthBloc>().add(AuthGetProfileRequested());
                      },
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            );
          }
          if (state is AuthAuthenticated) {
            final user = state.user;
            if (!_isInitialDataLoaded) {
              _nameController.text = user.name;
              _phoneController.text = user.phone ?? '';
              _birthPlaceController.text = user.birthPlace ?? '';
              _selectedDob = user.dob;

              if (user.birthTime != null) {
                final parts = user.birthTime!.split(':');
                if (parts.length == 2) {
                  _selectedBirthTime = TimeOfDay(
                    hour: int.parse(parts[0]),
                    minute: int.parse(parts[1]),
                  );
                }
              }
              _isInitialDataLoaded = true;
            }

            return SafeArea(
              child: Form(
                key: _formKey,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(12, 8, 12, 20),
                  child: Column(
                    children: [
                      _progressHeader(),
                      const SizedBox(height: 28),
                      Expanded(
                        child: SingleChildScrollView(
                          child: _stepContent(),
                        ),
                      ),
                      const SizedBox(height: 20),
                      Row(
                        children: [
                          if (_currentStep > 0)
                            TextButton(
                              onPressed: () => setState(() => _currentStep -= 1),
                              child: const Text(
                                'Back',
                                style: TextStyle(color: Colors.black87, fontSize: 16),
                              ),
                            )
                          else
                            const SizedBox(width: 70),
                          const Spacer(),
                          ElevatedButton(
                            onPressed: state is AuthLoading ? null : _handleNext,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFF48CA8),
                              foregroundColor: Colors.white,
                              minimumSize: const Size(150, 52),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                              elevation: 0,
                            ),
                            child: Text(
                              _currentStep == 2 ? 'Confirm' : 'Next',
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            );
          }

          return const Center(child: CircularProgressIndicator());
        },
      ),
    );
  }
}

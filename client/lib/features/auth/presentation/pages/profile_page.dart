import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart';
import '../widgets/auth_textfield.dart';
import '../widgets/auth_button.dart';
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
      if (_selectedBirthTime != null) {
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

            return SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Form(
                key: _formKey,
                child: Column(
                  children: [
                    const CircleAvatar(
                      radius: 50,
                      child: Icon(Icons.person, size: 50),
                    ),
                    const SizedBox(height: 20),
                    Text(
                      user.phone ?? user.email ?? 'Mobile verified user',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 30),
                    AuthTextField(
                      controller: _nameController,
                      label: 'Name',
                      validator: Validators.validateName,
                    ),
                    const SizedBox(height: 16),
                    AuthTextField(
                      controller: _phoneController,
                      label: 'Phone',
                      keyboardType: TextInputType.phone,
                      validator: Validators.validatePhone,
                    ),
                    const SizedBox(height: 16),
                    ListTile(
                      title: Text(_selectedDob == null ? 'Date of Birth' : 'DOB: ${_selectedDob!.toString().split(' ')[0]}'),
                      trailing: const Icon(Icons.calendar_today),
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
                    ),
                    const SizedBox(height: 16),
                    ListTile(
                      title: Text(_selectedBirthTime == null ? 'Birth Time' : 'Time: ${_selectedBirthTime!.format(context)}'),
                      trailing: const Icon(Icons.access_time),
                      onTap: () async {
                        final time = await showTimePicker(
                          context: context,
                          initialTime: _selectedBirthTime ?? TimeOfDay.now(),
                        );
                        if (time != null) {
                          setState(() => _selectedBirthTime = time);
                        }
                      },
                    ),
                    const SizedBox(height: 16),
                    AuthTextField(
                      controller: _birthPlaceController,
                      label: 'Birth Place',
                    ),
                    const SizedBox(height: 24),
                    AuthButton(
                      text: 'Update Profile',
                      onPressed: _onUpdatePressed,
                      isLoading: state is AuthLoading,
                    ),
                  ],
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

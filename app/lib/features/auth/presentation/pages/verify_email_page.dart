import 'package:flutter/material.dart';

import '../../../../core/constants/app_constants.dart';

/// Legacy route name kept for navigation stability. Auth is phone + JWT against the MongoDB-backed API.
class VerifyEmailPage extends StatelessWidget {
  const VerifyEmailPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Sign in'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.phone_android,
              size: 80,
              color: Theme.of(context).colorScheme.primary,
            ),
            const SizedBox(height: 24),
            Text(
              'This app signs you in with your mobile number and password. Your account is stored on the server — there is no separate email verification step.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            const SizedBox(height: 32),
            FilledButton(
              onPressed: () {
                Navigator.pushReplacementNamed(context, AppConstants.loginRoute);
              },
              child: const Text('Go to login'),
            ),
          ],
        ),
      ),
    );
  }
}

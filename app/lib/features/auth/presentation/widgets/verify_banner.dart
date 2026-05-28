import 'package:flutter/material.dart';

class VerifyBanner extends StatelessWidget {
  final VoidCallback onResendPressed;
  final VoidCallback onDismissPressed;

  const VerifyBanner({
    super.key,
    required this.onResendPressed,
    required this.onDismissPressed,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final primary = theme.colorScheme.primary;
    final surface = theme.colorScheme.primaryContainer;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: surface,
        border: Border(
          bottom: BorderSide(color: primary.withOpacity(0.3), width: 1),
        ),
      ),
      child: Row(
        children: [
          Icon(Icons.info_outline, color: primary, size: 22),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              'Please verify your email address',
              style: TextStyle(
                fontWeight: FontWeight.w500,
                color: theme.colorScheme.onSurface,
              ),
            ),
          ),
          TextButton(
            onPressed: onResendPressed,
            child: const Text('Resend'),
          ),
          IconButton(
            icon: const Icon(Icons.close),
            onPressed: onDismissPressed,
          ),
        ],
      ),
    );
  }
}

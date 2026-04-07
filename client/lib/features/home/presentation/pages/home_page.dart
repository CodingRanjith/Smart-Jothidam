import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/utils/profile_completion.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_state.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;

    // TODO: Replace with real modules from backend/config
    final modules = [
      'My Josiyam',
      'Couple Josiyam',
      'Career Guidance',
      'Health Insights',
      'Wealth & Finance',
      'Family & Relationships',
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Smart Jothidam'),
        actions: [
          IconButton(
            icon: const Icon(Icons.person_outline),
            onPressed: () {
              Navigator.pushNamed(context, AppConstants.profileRoute);
            },
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Welcome,',
              style: textTheme.titleMedium?.copyWith(
                color: theme.colorScheme.onSurface.withOpacity(0.8),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Your Astrology Dashboard',
              style: textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 4 / 3,
                ),
                itemCount: modules.length,
                itemBuilder: (context, index) {
                  final module = modules[index];
                  return _ModuleCard(
                    title: module,
                    onTap: () {
                      final auth = context.read<AuthBloc>().state;
                      if (module == 'My Josiyam') {
                        if (auth is! AuthAuthenticated) {
                          Navigator.pushNamed(context, AppConstants.loginRoute);
                          return;
                        }
                        if (!isJosiyamProfileComplete(auth.user)) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text(
                                'Add date of birth, birth time, and birth place in your profile to use My Josiyam.',
                              ),
                            ),
                          );
                          Navigator.pushNamed(context, AppConstants.profileRoute);
                          return;
                        }
                        Navigator.pushNamed(
                          context,
                          AppConstants.singleJosiyamRoute,
                        );
                        return;
                      }
                      if (module == 'Couple Josiyam') {
                        if (auth is! AuthAuthenticated) {
                          Navigator.pushNamed(context, AppConstants.loginRoute);
                          return;
                        }
                        Navigator.pushNamed(
                          context,
                          AppConstants.coupleJosiyamRoute,
                        );
                        return;
                      }
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ModuleCard extends StatelessWidget {
  final String title;
  final VoidCallback onTap;

  const _ModuleCard({
    required this.title,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;

    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: onTap,
      child: Ink(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          color: theme.colorScheme.primaryContainer.withOpacity(0.9),
        ),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Icon(
                Icons.auto_awesome,
                color: theme.colorScheme.onPrimaryContainer,
                size: 28,
              ),
              Text(
                title,
                style: textTheme.titleMedium?.copyWith(
                  color: theme.colorScheme.onPrimaryContainer,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}


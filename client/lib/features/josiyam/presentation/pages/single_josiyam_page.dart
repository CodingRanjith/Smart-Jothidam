import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:share_plus/share_plus.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/utils/profile_completion.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import '../../domain/entities/josiyam_result_entity.dart';
import '../bloc/josiyam_bloc.dart';
import '../bloc/josiyam_event.dart';
import '../bloc/josiyam_state.dart';
import '../utils/josiyam_pdf_export.dart';

class SingleJosiyamPage extends StatefulWidget {
  /// When set (e.g. deep link), loads GET `/api/josiyam/result/:id` instead of recalculating.
  final String? resultId;

  const SingleJosiyamPage({super.key, this.resultId});

  @override
  State<SingleJosiyamPage> createState() => _SingleJosiyamPageState();
}

class _SingleJosiyamPageState extends State<SingleJosiyamPage> {
  /// BCP-47 language for summary text (server default is ta-IN).
  static const String _lang = 'en';

  /// Avoids an endless spinner when profile preflight fails (dialog is shown).
  bool _preflightProfileIncomplete = false;

  bool _exportingPdf = false;

  static const List<String> _categoryOrder = [
    'Career',
    'Business',
    'Finance',
    'Education',
    'Marriage',
    'Love',
    'Family',
    'Children',
    'Health',
    'Mental strength',
    'Spiritual',
    'Foreign travel',
    'Property',
    'Legal',
    'Enemy',
    'Social status',
    'Friends',
    'Luck',
    'Remedies',
    'Overall life path',
  ];

  void _dispatchFetch() {
    context.read<JosiyamBloc>().add(
          const FetchSingleJosiyamRequested(
            useProfile: true,
            language: _lang,
          ),
        );
  }

  void _showBirthDetailsRequiredAlert() {
    showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        title: const Text('Birth details needed'),
        content: const Text(
          'To get your josiyam, please complete your birth details first',
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              Navigator.of(context).pushReplacementNamed(
                AppConstants.profileRoute,
              );
            },
            child: const Text('Go to Profile'),
          ),
        ],
      ),
    );
  }

  void _preflightThenFetch() {
    if (!mounted) return;
    final auth = context.read<AuthBloc>().state;
    if (auth is! AuthAuthenticated) {
      Navigator.pushReplacementNamed(context, AppConstants.loginRoute);
      return;
    }
    if (!isJosiyamProfileComplete(auth.user)) {
      setState(() => _preflightProfileIncomplete = true);
      _showBirthDetailsRequiredAlert();
      return;
    }
    setState(() => _preflightProfileIncomplete = false);
    _dispatchFetch();
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final rid = widget.resultId;
      if (rid != null && rid.isNotEmpty) {
        if (!mounted) return;
        final auth = context.read<AuthBloc>().state;
        if (auth is! AuthAuthenticated) {
          Navigator.pushReplacementNamed(context, AppConstants.loginRoute);
          return;
        }
        context.read<JosiyamBloc>().add(LoadSingleJosiyamByResultId(rid));
        return;
      }
      _preflightThenFetch();
    });
  }

  /// No birth dates/times/places — narrative + optional reopen hint.
  Future<void> _shareSafeSummary(JosiyamResultEntity result) async {
    final summary = result.aiNarrative?.summary.trim() ?? '';
    final buffer = StringBuffer()
      ..writeln('Smart Jothidam — Josiyam summary')
      ..writeln();
    if (summary.isNotEmpty) {
      buffer.writeln(summary);
    }
    final rid = result.resultId;
    if (rid != null && rid.isNotEmpty) {
      buffer
        ..writeln()
        ..writeln(
          'Result ID: $rid — reopen in the app while signed in to view the full report.',
        );
    }
    await Share.share(buffer.toString());
  }

  Future<void> _onExportPdf(JosiyamResultEntity result) async {
    final rid = result.resultId;
    if (rid == null || rid.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'No saved result id yet. Use Recalculate, then try Export PDF.',
          ),
        ),
      );
      return;
    }
    setState(() => _exportingPdf = true);
    try {
      await exportJosiyamReportPdf(
        context: context,
        resultId: rid,
        type: 'single',
        language: result.aiNarrative?.language,
      );
    } finally {
      if (mounted) setState(() => _exportingPdf = false);
    }
  }

  /// Opens Profile and, when the user returns, re-runs preflight + fetch so [JosiyamBloc] does not stay stuck in loading.
  Future<void> _openProfileThenRefresh() async {
    await Navigator.pushNamed(context, AppConstants.profileRoute);
    if (!mounted) return;
    _preflightThenFetch();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Josiyam'),
        actions: [
          if (ApiConstants.premiumGateEnabled)
            const Padding(
              padding: EdgeInsets.only(right: 12),
              child: Center(
                child: Tooltip(
                  message: 'PDF export may require premium when enabled on server',
                  child: Icon(Icons.workspace_premium_outlined, size: 22),
                ),
              ),
            ),
        ],
      ),
      body: BlocListener<AuthBloc, AuthState>(
        listenWhen: (previous, current) =>
            previous is AuthLoading && current is AuthAuthenticated,
        listener: (context, state) {
          if (!mounted) return;
          // Profile GET/PUT finished while this route may be under Profile; refresh josiyam so loading clears.
          _preflightThenFetch();
        },
        child: BlocBuilder<JosiyamBloc, JosiyamState>(
        builder: (context, state) {
          if (_preflightProfileIncomplete &&
              (state is SingleJosiyamInitial || state is SingleJosiyamLoading)) {
            return const SizedBox.shrink();
          }

          if (state is SingleJosiyamLoading || state is SingleJosiyamInitial) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state is SingleJosiyamLoaded) {
            final result = state.result;
            final ai = result.aiNarrative;
            final categories = result.categories;

            return SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _ChartCard(result: result),
                  const SizedBox(height: 16),
                  if (ai != null && ai.summary.trim().isNotEmpty) ...[
                    _SectionTitle(title: 'Summary'),
                    Text(
                      ai.summary,
                      style: Theme.of(context).textTheme.bodyLarge,
                    ),
                    const SizedBox(height: 16),
                  ],
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      FilledButton.icon(
                        onPressed: _preflightThenFetch,
                        icon: const Icon(Icons.refresh),
                        label: const Text('Recalculate'),
                      ),
                      OutlinedButton.icon(
                        onPressed: _exportingPdf
                            ? null
                            : () => _onExportPdf(result),
                        icon: _exportingPdf
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : const Icon(Icons.picture_as_pdf_outlined),
                        label: Text(_exportingPdf ? 'Preparing…' : 'Export PDF'),
                      ),
                      OutlinedButton.icon(
                        onPressed: () => _shareSafeSummary(result),
                        icon: const Icon(Icons.share_outlined),
                        label: const Text('Share summary'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text(
                              'Contextual AI chat will be available in a future update.',
                            ),
                          ),
                        );
                      },
                      child: const Text('Ask more via AI chat'),
                    ),
                  ),
                  const SizedBox(height: 16),
                  _SectionTitle(title: '20 Category Insights'),
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _categoryOrder.length,
                    itemBuilder: (context, index) {
                      final key = _categoryOrder[index];
                      final cat = categories[key];
                      if (cat == null) {
                        return const SizedBox.shrink();
                      }

                      final hasAiText =
                          (cat.aiNarrative?.trim().isNotEmpty ?? false);

                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: ExpansionTile(
                          title: Row(
                            children: [
                              Expanded(
                                child: Text(
                                  key,
                                  style: Theme.of(context).textTheme.titleMedium,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Chip(
                                label: Text('${cat.score}/5'),
                              ),
                            ],
                          ),
                          children: [
                            const SizedBox(height: 8),
                            Padding(
                              padding:
                                  const EdgeInsets.symmetric(horizontal: 16),
                              child: Text(
                                cat.rawInterpretation,
                                style: Theme.of(context).textTheme.bodyMedium,
                              ),
                            ),
                            if (hasAiText) ...[
                              const SizedBox(height: 12),
                              Padding(
                                padding:
                                    const EdgeInsets.symmetric(horizontal: 16),
                                child: Text(
                                  'AI: ${cat.aiNarrative}',
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodyMedium
                                      ?.copyWith(fontWeight: FontWeight.w600),
                                ),
                              ),
                            ],
                            const SizedBox(height: 12),
                          ],
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            );
          }

          if (state is SingleJosiyamProfileIncomplete) {
            return _ProfileIncompleteBody(
              missingFields: state.missingFields,
              onOpenProfile: _openProfileThenRefresh,
              onRetry: _preflightThenFetch,
            );
          }

          if (state is SingleJosiyamError) {
            return _ErrorBody(
              message: state.message,
              onRetry: _preflightThenFetch,
              onOpenProfile: _openProfileThenRefresh,
            );
          }

          return const Center(child: Text('Failed to load Josiyam.'));
        },
        ),
      ),
    );
  }
}

class _ProfileIncompleteBody extends StatelessWidget {
  final List<String> missingFields;
  final VoidCallback onOpenProfile;
  final VoidCallback onRetry;

  const _ProfileIncompleteBody({
    required this.missingFields,
    required this.onOpenProfile,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.person_outline, size: 56, color: theme.colorScheme.error),
          const SizedBox(height: 16),
          Text(
            'Birth details needed',
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            'To get your josiyam, please complete your birth details first',
            style: theme.textTheme.bodyMedium,
            textAlign: TextAlign.center,
          ),
          if (missingFields.isNotEmpty) ...[
            const SizedBox(height: 12),
            Wrap(
              alignment: WrapAlignment.center,
              spacing: 8,
              children: missingFields
                  .map((f) => Chip(label: Text(f)))
                  .toList(),
            ),
          ],
          const SizedBox(height: 24),
          FilledButton(
            onPressed: onOpenProfile,
            child: const Text('Complete your profile'),
          ),
          TextButton(
            onPressed: onRetry,
            child: const Text('Try again'),
          ),
        ],
      ),
    );
  }
}

class _ErrorBody extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  final VoidCallback onOpenProfile;

  const _ErrorBody({
    required this.message,
    required this.onRetry,
    required this.onOpenProfile,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final lower = message.toLowerCase();
    final hintsProfile = lower.contains('profile') ||
        lower.contains('dob') ||
        lower.contains('birth') ||
        lower.contains('place');

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, size: 48, color: theme.colorScheme.error),
          const SizedBox(height: 16),
          Text(
            message,
            style: theme.textTheme.bodyLarge,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: onRetry,
            child: const Text('Retry'),
          ),
          if (hintsProfile) ...[
            const SizedBox(height: 8),
            TextButton(
              onPressed: onOpenProfile,
              child: const Text('Complete your profile'),
            ),
          ],
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;

  const _SectionTitle({required this.title});

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.w800,
          ),
    );
  }
}

class _ChartCard extends StatelessWidget {
  final JosiyamResultEntity result;

  const _ChartCard({required this.result});

  @override
  Widget build(BuildContext context) {
    final chart = result.chart;
    final theme = Theme.of(context);
    final prominent = theme.textTheme.headlineSmall?.copyWith(
      fontWeight: FontWeight.w700,
    );

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Your chart',
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 16),
            _ProminentRow(label: 'Rasi', value: chart.rasi, style: prominent),
            const SizedBox(height: 12),
            _ProminentRow(
              label: 'Nakshatra',
              value: chart.nakshatra,
              style: prominent,
            ),
            const SizedBox(height: 12),
            _ProminentRow(
              label: 'Lagnam',
              value: chart.lagnam,
              style: prominent,
            ),
            const SizedBox(height: 12),
            Text(
              'Ayanamsa: ${chart.ayanamsa}',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurface.withValues(alpha: 0.85),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProminentRow extends StatelessWidget {
  final String label;
  final String value;
  final TextStyle? style;

  const _ProminentRow({
    required this.label,
    required this.value,
    required this.style,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      crossAxisAlignment: CrossAxisAlignment.baseline,
      textBaseline: TextBaseline.alphabetic,
      children: [
        SizedBox(
          width: 100,
          child: Text(
            label,
            style: theme.textTheme.titleMedium?.copyWith(
              color: theme.colorScheme.primary,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: style,
          ),
        ),
      ],
    );
  }
}

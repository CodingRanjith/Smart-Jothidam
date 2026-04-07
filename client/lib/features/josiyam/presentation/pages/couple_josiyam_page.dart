import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:share_plus/share_plus.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/utils/profile_completion.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import '../../domain/entities/couple_josiyam_result_entity.dart';
import '../../domain/entities/josiyam_chart_entity.dart';
import '../../domain/entities/partner_profile_entity.dart';
import '../bloc/couple_josiyam_bloc.dart';
import '../bloc/couple_josiyam_event.dart';
import '../bloc/couple_josiyam_state.dart';
import '../utils/josiyam_pdf_export.dart';

class CoupleJosiyamPage extends StatefulWidget {
  final String? resultId;

  const CoupleJosiyamPage({super.key, this.resultId});

  @override
  State<CoupleJosiyamPage> createState() => _CoupleJosiyamPageState();
}

class _CoupleJosiyamPageState extends State<CoupleJosiyamPage> {
  static const List<String> _categoryDisplayOrder = [
    'Compatibility score',
    'Emotional bond',
    'Financial stability',
    'Family harmony',
    'Long-term growth',
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

  final _aDob = TextEditingController();
  final _aTime = TextEditingController();
  final _aPlace = TextEditingController();
  final _bDob = TextEditingController();
  final _bTime = TextEditingController();
  final _bPlace = TextEditingController();

  bool _useProfiles = true;
  String? _partnerAId;
  String? _partnerBId;
  String _language = 'ta-IN';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final auth = context.read<AuthBloc>().state;
      if (auth is! AuthAuthenticated) {
        Navigator.pushReplacementNamed(context, AppConstants.loginRoute);
        return;
      }
      final rid = widget.resultId;
      if (rid != null && rid.isNotEmpty) {
        context.read<CoupleJosiyamBloc>().add(LoadCoupleJosiyamByResultId(rid));
        return;
      }
      context.read<CoupleJosiyamBloc>().add(const LoadCouplePartnersRequested());
    });
  }

  @override
  void dispose() {
    _aDob.dispose();
    _aTime.dispose();
    _aPlace.dispose();
    _bDob.dispose();
    _bTime.dispose();
    _bPlace.dispose();
    super.dispose();
  }

  static final _isoDate = RegExp(r'^\d{4}-\d{2}-\d{2}$');

  String? _validateManual() {
    for (final e in [
      (_aDob.text.trim(), 'Partner A date of birth (YYYY-MM-DD)'),
      (_aTime.text.trim(), 'Partner A birth time'),
      (_aPlace.text.trim(), 'Partner A birth place'),
      (_bDob.text.trim(), 'Partner B date of birth'),
      (_bTime.text.trim(), 'Partner B birth time'),
      (_bPlace.text.trim(), 'Partner B birth place'),
    ]) {
      if (e.$1.isEmpty) return '${e.$2} is required';
    }
    if (!_isoDate.hasMatch(_aDob.text.trim())) {
      return 'Partner A: use ISO date YYYY-MM-DD';
    }
    if (!_isoDate.hasMatch(_bDob.text.trim())) {
      return 'Partner B: use ISO date YYYY-MM-DD';
    }
    if (!josiyamBirthTimePattern.hasMatch(_aTime.text.trim())) {
      return 'Partner A: birth time must be HH:mm (24h)';
    }
    if (!josiyamBirthTimePattern.hasMatch(_bTime.text.trim())) {
      return 'Partner B: birth time must be HH:mm (24h)';
    }
    return null;
  }

  void _submit(List<PartnerProfileEntity> partners) {
    Map<String, dynamic> body;
    if (_useProfiles) {
      if (_partnerAId == null || _partnerBId == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Select both partner profiles')),
        );
        return;
      }
      if (_partnerAId == _partnerBId) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Partner A and B must be different')),
        );
        return;
      }
      body = {
        'useProfiles': true,
        'partnerA': {'profileId': _partnerAId},
        'partnerB': {'profileId': _partnerBId},
        'language': _language,
      };
    } else {
      final err = _validateManual();
      if (err != null) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(err)));
        return;
      }
      body = {
        'useProfiles': false,
        'partnerA': {
          'dateOfBirth': _aDob.text.trim(),
          'birthTime': _aTime.text.trim(),
          'birthPlace': _aPlace.text.trim(),
        },
        'partnerB': {
          'dateOfBirth': _bDob.text.trim(),
          'birthTime': _bTime.text.trim(),
          'birthPlace': _bPlace.text.trim(),
        },
        'language': _language,
      };
    }

    context.read<CoupleJosiyamBloc>().add(
          FetchCoupleJosiyamRequested(body, partnersSnapshot: partners),
        );
  }

  Future<void> _shareSafeSummary(CoupleJosiyamResultEntity result) async {
    final summary = result.aiNarrative?.summary.trim() ?? '';
    final buffer = StringBuffer()
      ..writeln('Smart Jothidam — Couple Josiyam summary')
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

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Couple Josiyam'),
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
      body: BlocConsumer<CoupleJosiyamBloc, CoupleJosiyamState>(
        listener: (context, state) {
          if (state is CoupleJosiyamError && state.partners.isEmpty) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(state.message)),
            );
          }
        },
        builder: (context, state) {
          if (state is CoupleJosiyamInitial ||
              state is CoupleJosiyamPartnersLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state is CoupleJosiyamError && state.partners.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(state.message, textAlign: TextAlign.center),
                    const SizedBox(height: 16),
                    FilledButton(
                      onPressed: () => context
                          .read<CoupleJosiyamBloc>()
                          .add(const LoadCouplePartnersRequested()),
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            );
          }

          List<PartnerProfileEntity> partners = [];
          if (state is CoupleJosiyamReady) {
            partners = state.partners;
          } else if (state is CoupleJosiyamSubmitting) {
            partners = state.partners;
          } else if (state is CoupleJosiyamLoadSuccess) {
            partners = state.partners;
          } else if (state is CoupleJosiyamError) {
            partners = state.partners;
          }

          if (state is CoupleJosiyamLoadSuccess) {
            return _ResultView(
              result: state.result,
              partners: partners,
              categoryOrder: _categoryDisplayOrder,
              onRecalculate: () {
                context.read<CoupleJosiyamBloc>().add(
                      ResetCoupleJosiyamForm(partners),
                    );
              },
              onShare: () => _shareSafeSummary(state.result),
            );
          }

          final busy = state is CoupleJosiyamSubmitting;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Compatibility (25 categories)',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),
                SegmentedButton<bool>(
                  segments: const [
                    ButtonSegment(value: true, label: Text('Saved profiles')),
                    ButtonSegment(value: false, label: Text('Manual entry')),
                  ],
                  selected: {_useProfiles},
                  onSelectionChanged: (s) {
                    setState(() => _useProfiles = s.first);
                  },
                ),
                const SizedBox(height: 16),
                if (_useProfiles) ...[
                  if (partners.length < 2)
                    Card(
                      color: theme.colorScheme.surfaceContainerHighest,
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Text(
                          'You need at least two saved partner profiles. '
                          'Switch to manual entry, or create profiles via the API POST /api/partners.',
                          style: theme.textTheme.bodyMedium,
                        ),
                      ),
                    )
                  else ...[
                    DropdownButtonFormField<String>(
                      decoration: const InputDecoration(
                        labelText: 'Partner A',
                        border: OutlineInputBorder(),
                      ),
                      value: _partnerAId,
                      items: partners
                          .map(
                            (p) => DropdownMenuItem(
                              value: p.id,
                              child: Text(
                                p.displayName.isNotEmpty
                                    ? p.displayName
                                    : 'Profile ${p.id.length > 8 ? '${p.id.substring(0, 8)}…' : p.id}',
                              ),
                            ),
                          )
                          .toList(),
                      onChanged: busy
                          ? null
                          : (v) => setState(() => _partnerAId = v),
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      decoration: const InputDecoration(
                        labelText: 'Partner B',
                        border: OutlineInputBorder(),
                      ),
                      value: _partnerBId,
                      items: partners
                          .map(
                            (p) => DropdownMenuItem(
                              value: p.id,
                              child: Text(
                                p.displayName.isNotEmpty
                                    ? p.displayName
                                    : 'Profile ${p.id.length > 8 ? '${p.id.substring(0, 8)}…' : p.id}',
                              ),
                            ),
                          )
                          .toList(),
                      onChanged: busy
                          ? null
                          : (v) => setState(() => _partnerBId = v),
                    ),
                  ],
                ] else ...[
                  Text('Partner A', style: theme.textTheme.titleSmall),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _aDob,
                    decoration: const InputDecoration(
                      labelText: 'Date of birth (YYYY-MM-DD)',
                      border: OutlineInputBorder(),
                    ),
                    readOnly: busy,
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _aTime,
                    decoration: const InputDecoration(
                      labelText: 'Birth time (HH:mm)',
                      border: OutlineInputBorder(),
                    ),
                    readOnly: busy,
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _aPlace,
                    decoration: const InputDecoration(
                      labelText: 'Birth place',
                      border: OutlineInputBorder(),
                    ),
                    readOnly: busy,
                  ),
                  const SizedBox(height: 16),
                  Text('Partner B', style: theme.textTheme.titleSmall),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _bDob,
                    decoration: const InputDecoration(
                      labelText: 'Date of birth (YYYY-MM-DD)',
                      border: OutlineInputBorder(),
                    ),
                    readOnly: busy,
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _bTime,
                    decoration: const InputDecoration(
                      labelText: 'Birth time (HH:mm)',
                      border: OutlineInputBorder(),
                    ),
                    readOnly: busy,
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _bPlace,
                    decoration: const InputDecoration(
                      labelText: 'Birth place',
                      border: OutlineInputBorder(),
                    ),
                    readOnly: busy,
                  ),
                ],
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  decoration: const InputDecoration(
                    labelText: 'Language (summary & AI text)',
                    border: OutlineInputBorder(),
                  ),
                  value: _language,
                  items: const [
                    DropdownMenuItem(value: 'ta-IN', child: Text('Tamil (ta-IN)')),
                    DropdownMenuItem(value: 'en-IN', child: Text('English (en-IN)')),
                    DropdownMenuItem(value: 'en-US', child: Text('English (en-US)')),
                    DropdownMenuItem(value: 'tl-IN', child: Text('Tanglish (tl-IN)')),
                  ],
                  onChanged: busy
                      ? null
                      : (v) {
                          if (v != null) setState(() => _language = v);
                        },
                ),
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: busy ? null : () => _submit(partners),
                  child: busy
                      ? const SizedBox(
                          height: 22,
                          width: 22,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Calculate couple josiyam'),
                ),
                if (state is CoupleJosiyamError && state.partners.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Text(
                    state.message,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.error,
                    ),
                  ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}

class _ResultView extends StatefulWidget {
  final CoupleJosiyamResultEntity result;
  final List<PartnerProfileEntity> partners;
  final List<String> categoryOrder;
  final VoidCallback onRecalculate;
  final VoidCallback onShare;

  const _ResultView({
    required this.result,
    required this.partners,
    required this.categoryOrder,
    required this.onRecalculate,
    required this.onShare,
  });

  @override
  State<_ResultView> createState() => _ResultViewState();
}

class _ResultViewState extends State<_ResultView> {
  bool _exportingPdf = false;

  Future<void> _exportPdf(BuildContext context) async {
    final rid = widget.result.resultId;
    if (rid == null || rid.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'No saved result id. Run Calculate again, then export.',
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
        type: 'couple',
        language: widget.result.aiNarrative?.language,
      );
    } finally {
      if (mounted) setState(() => _exportingPdf = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final result = widget.result;
    final chart = result.chart;
    final meta = chart.compatibilityMeta;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                'Couple compatibility',
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            TextButton.icon(
              onPressed: widget.onRecalculate,
              icon: const Icon(Icons.refresh),
              label: const Text('Recalculate'),
            ),
            TextButton.icon(
              onPressed: _exportingPdf ? null : () => _exportPdf(context),
              icon: _exportingPdf
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.picture_as_pdf_outlined),
              label: Text(_exportingPdf ? '…' : 'PDF'),
            ),
            IconButton(
              onPressed: widget.onShare,
              icon: const Icon(Icons.share_outlined),
              tooltip: 'Share summary',
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text('Ayanamsa: ${chart.ayanamsa}', style: theme.textTheme.bodyMedium),
        if (meta != null && meta.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Text(
              'Meta: ${meta.entries.map((e) => '${e.key}: ${e.value}').join(', ')}',
              style: theme.textTheme.bodySmall,
            ),
          ),
        const SizedBox(height: 16),
        _ChartCard(title: 'Partner A', chart: chart.partnerA),
        const SizedBox(height: 12),
        _ChartCard(title: 'Partner B', chart: chart.partnerB),
        const SizedBox(height: 16),
        if ((result.aiNarrative?.summary ?? '').trim().isNotEmpty) ...[
          Text('Summary', style: theme.textTheme.titleMedium),
          const SizedBox(height: 8),
          Text(result.aiNarrative!.summary),
          const SizedBox(height: 16),
        ],
        Text('Categories', style: theme.textTheme.titleMedium),
        const SizedBox(height: 8),
        ...widget.categoryOrder.map((title) {
          final cat = result.categories[title];
          if (cat == null) return const SizedBox.shrink();
          return Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: ExpansionTile(
              title: Text(title),
              subtitle: Text(
                'Score: ${cat.score}/5 · ${cat.trend ?? '—'}',
              ),
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      cat.aiNarrative?.trim().isNotEmpty == true
                          ? cat.aiNarrative!.trim()
                          : cat.rawInterpretation,
                    ),
                  ),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }
}

class _ChartCard extends StatelessWidget {
  final String title;
  final JosiyamChartEntity chart;

  const _ChartCard({required this.title, required this.chart});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: theme.textTheme.titleSmall),
            const SizedBox(height: 4),
            Text('Rasi: ${chart.rasi}'),
            Text('Nakshatra: ${chart.nakshatra}'),
            Text('Lagnam: ${chart.lagnam}'),
          ],
        ),
      ),
    );
  }
}

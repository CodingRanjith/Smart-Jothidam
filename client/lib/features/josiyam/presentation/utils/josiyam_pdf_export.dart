import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import '../../domain/repositories/josiyam_repository.dart';

/// Premium-gated PDF download + share sheet (server enforces premium when enabled).
Future<void> exportJosiyamReportPdf({
  required BuildContext context,
  required String resultId,
  required String type,
  String? language,
}) async {
  final messenger = ScaffoldMessenger.of(context);
  final auth = context.read<AuthBloc>().state;
  if (auth is! AuthAuthenticated) {
    messenger.showSnackBar(
      const SnackBar(content: Text('Sign in to export PDF.')),
    );
    return;
  }

  if (ApiConstants.premiumGateEnabled && !auth.user.isPremium) {
    await showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Premium feature'),
        content: const Text(
          'PDF reports are available on the premium plan. Upgrade to export a full document.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
    return;
  }

  final repo = context.read<JosiyamRepository>();

  try {
    final bytes = await repo.downloadReportPdf(
      resultId: resultId,
      type: type,
      language: language,
    );
    final dir = await getTemporaryDirectory();
    final path =
        '${dir.path}${Platform.pathSeparator}josiyam-report-$resultId.pdf';
    final file = File(path);
    await file.writeAsBytes(bytes, flush: true);
    await Share.shareXFiles(
      [XFile(file.path)],
      text: 'Smart Jothidam — Josiyam report',
    );
  } catch (e) {
    messenger.showSnackBar(
      SnackBar(
        content: Text('Could not generate PDF. Try again. ($e)'),
      ),
    );
  }
}

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';

import '../theme/app_theme.dart';

class AppLoaderPage extends StatefulWidget {
  final Widget nextPage;
  final Duration duration;
  final String message;

  const AppLoaderPage({
    super.key,
    required this.nextPage,
    this.duration = const Duration(seconds: 3),
    this.message = 'Loading...',
  });

  @override
  State<AppLoaderPage> createState() => _AppLoaderPageState();
}

class _AppLoaderPageState extends State<AppLoaderPage> {
  @override
  void initState() {
    super.initState();
    _openNext();
  }

  Future<void> _openNext() async {
    await Future<void>.delayed(widget.duration);
    if (!mounted) return;
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => widget.nextPage),
    );
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: AppColors.burgundySurface,
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              width: 170,
              height: 170,
              child: Lottie.asset('assets/loading.json', fit: BoxFit.contain),
            ),
            const SizedBox(height: 16),
            Text(
              widget.message,
              style: textTheme.titleMedium?.copyWith(
                color: AppColors.burgundyDark,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

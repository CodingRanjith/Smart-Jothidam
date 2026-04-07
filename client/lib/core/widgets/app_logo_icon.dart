import 'package:flutter/material.dart';

/// Brand mark: simple Material icon (no raster logo asset).
class AppLogoIcon extends StatelessWidget {
  const AppLogoIcon({
    super.key,
    required this.size,
    this.color,
  });

  final double size;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return Icon(
      Icons.auto_awesome,
      size: size,
      color: color ?? Theme.of(context).colorScheme.primary,
    );
  }
}

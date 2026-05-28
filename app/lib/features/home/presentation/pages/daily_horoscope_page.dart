import 'package:flutter/material.dart';

class DailyHoroscopePage extends StatelessWidget {
  const DailyHoroscopePage({super.key});

  String _formatDate(DateTime date) {
    const months = <String>[
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return '${months[date.month - 1]} ${date.day}, ${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final today = _formatDate(now);
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: const Color(0xFFF3F1F8),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF3F1F8),
        elevation: 0,
        title: const Text('Daily Horoscope'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFFE7E2F8),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                today,
                style: textTheme.labelLarge?.copyWith(
                  color: const Color(0xFF5E4B95),
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            const SizedBox(height: 14),
            Text(
              'Today\'s Horoscope',
              style: textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w700,
                color: const Color(0xFF232129),
              ),
            ),
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                'Pluto exposing buried truths. Focus on honest communication and trust your intuition in important choices today.',
                style: textTheme.bodyLarge?.copyWith(
                  color: const Color(0xFF383541),
                  height: 1.4,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

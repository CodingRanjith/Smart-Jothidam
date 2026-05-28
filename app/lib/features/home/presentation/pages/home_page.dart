import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/widgets/app_loader_page.dart';
import '../../../../core/utils/profile_completion.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import 'daily_horoscope_page.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  void _handleModuleTap(BuildContext context, String module) {
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
      Navigator.pushNamed(context, AppConstants.singleJosiyamRoute);
      return;
    }
    if (module == 'Couple Josiyam') {
      if (auth is! AuthAuthenticated) {
        Navigator.pushNamed(context, AppConstants.loginRoute);
        return;
      }
      Navigator.pushNamed(context, AppConstants.coupleJosiyamRoute);
      return;
    }
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('$module will be available soon.')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;
    final colorScheme = theme.colorScheme;
    final now = DateTime.now();
    final currentYear = now.year;
    final startOfWeek = now.subtract(Duration(days: now.weekday - 1));
    final endOfWeek = startOfWeek.add(const Duration(days: 6));
    final moonStart = startOfWeek.subtract(const Duration(days: 4));
    final moonEnd = moonStart.add(const Duration(days: 8));
    final soulWeatherStart = startOfWeek;
    final soulWeatherEnd = soulWeatherStart.add(const Duration(days: 2));

    String formatSingleDate(DateTime date, {bool includeDot = false}) {
      final month = DateFormat(includeDot ? 'MMM.' : 'MMM').format(date);
      final day = DateFormat('dd').format(date);
      return '$month $day';
    }

    String formatDateRange(DateTime start, DateTime end) {
      return '${formatSingleDate(start, includeDot: true)} - ${formatSingleDate(end, includeDot: true)}';
    }

    final modules = [
      'My Josiyam',
      'Couple Josiyam',
      'Career Guidance',
      'Health Insights',
      'Wealth & Finance',
      'Family & Relationships',
    ];
    final zodiacChips = ['Cancer', 'Cancer', 'Aquarius'];
    final categories = [
      _CategoryChipData(icon: Icons.auto_awesome, label: '$currentYear'),
      _CategoryChipData(icon: Icons.favorite, label: 'Love'),
      _CategoryChipData(icon: Icons.sentiment_satisfied, label: 'Personality'),
      _CategoryChipData(icon: Icons.attach_money, label: 'Wealth'),
      _CategoryChipData(icon: Icons.handshake, label: 'Relationships'),
      _CategoryChipData(icon: Icons.lightbulb, label: 'Funsies'),
    ];
    final horoscopeCards = [
      _InfoCardData(
        badge: 'Today ${formatSingleDate(now).replaceFirst(' ', ', ')}',
        title: 'Daily Luck',
        subtitle: 'What\'s bringing you luck today?',
      ),
      _InfoCardData(
        badge: formatDateRange(startOfWeek, endOfWeek),
        title: 'Weekly Fortune',
        subtitle: 'Track your week in advance',
        showDot: true,
      ),
      _InfoCardData(
        badge: DateFormat('MMM').format(now),
        title: 'Monthly Fortune',
        subtitle: 'See your month at a glance',
        showDot: true,
      ),
    ];
    final lunarCards = [
      _InfoCardData(
        badge: formatDateRange(moonStart, moonEnd),
        title: 'Moon Phase',
        subtitle: 'Disseminating Moon in Gemini',
        showDot: true,
      ),
      _InfoCardData(
        badge: formatDateRange(soulWeatherStart, soulWeatherEnd),
        title: 'Soul Weather',
        subtitle: 'Moon in the 10th House',
        showDot: true,
      ),
    ];
    final whatsNewCards = [
      _BannerCardData(
        title: 'Love Bombing:\nAre You Easily Fooled\nOr Not?',
        colors: [colorScheme.primary, colorScheme.tertiary],
      ),
      _BannerCardData(
        title: 'How To Read\nCosmic Signs\nDaily',
        colors: [colorScheme.secondary, colorScheme.primary],
      ),
    ];
    final forecastCards = [
      _ForecastCardData(
        title: 'Is $currentYear Your Main Character Era?',
        views: '1.3K',
        likes: '7.1K',
      ),
      _ForecastCardData(
        title: 'Saturn Return Guide For New Beginnings',
        views: '980',
        likes: '5.9K',
      ),
    ];

    return Scaffold(
      backgroundColor: colorScheme.surface,
      appBar: AppBar(
        backgroundColor: colorScheme.surface,
        elevation: 0,
        leadingWidth: 52,
        iconTheme: IconThemeData(color: colorScheme.onSurface),
        actionsIconTheme: IconThemeData(color: colorScheme.onSurface),
        leading: Padding(
          padding: const EdgeInsets.only(left: 8),
          child: Center(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.asset(
                'assets/logo.png',
                height: 32,
                width: 32,
                fit: BoxFit.cover,
              ),
            ),
          ),
        ),
        title: const Text(''),
        actions: [
          IconButton(
            icon: const Icon(Icons.person_outline_rounded),
            onPressed: () {
              Navigator.pushNamed(context, AppConstants.profileRoute);
            },
          ),
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Search will be available soon.')),
              );
            },
          ),
        ],
      ),
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final isWide = constraints.maxWidth > 550;
            return SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Welcome, TM Gayathri B!',
                    style: textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: colorScheme.onSurface,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 10,
                    runSpacing: 6,
                    children: zodiacChips
                        .map((item) => Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  item == 'Aquarius'
                                      ? Icons.north_east
                                      : Icons.brightness_2_outlined,
                                  size: 14,
                                  color: colorScheme.onSurfaceVariant,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  item,
                                  style: textTheme.bodySmall?.copyWith(
                                    color: colorScheme.onSurfaceVariant,
                                  ),
                                ),
                              ],
                            ))
                        .toList(),
                  ),
                  const SizedBox(height: 16),
                  _HeroCard(
                    title: 'Real-Time Horoscope',
                    subtitle: 'Pluto exposing buried truths',
                    timing: '06:51 AM - 11:59 PM',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const AppLoaderPage(
                            nextPage: DailyHoroscopePage(),
                            duration: Duration(seconds: 1),
                            message: 'Calculating your results...',
                          ),
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 20),
                  _SectionTitle(title: 'Cancer Forecast'),
                  const SizedBox(height: 12),
                  _ResponsiveInfoCardsGrid(
                    cards: horoscopeCards,
                    maxWidth: constraints.maxWidth,
                  ),
                  const SizedBox(height: 20),
                  _SectionTitle(title: 'The Lunar Influence'),
                  const SizedBox(height: 12),
                  _ResponsiveInfoCardsGrid(
                    cards: lunarCards,
                    maxWidth: constraints.maxWidth,
                  ),
                  const SizedBox(height: 22),
                  Row(
                    children: [
                      Text(
                        'Free Reading Category',
                        style: textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(16),
                          color: colorScheme.secondaryContainer,
                        ),
                        child: Text(
                          '300+',
                          style: textTheme.labelMedium?.copyWith(
                            color: colorScheme.onSecondaryContainer,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: categories
                        .map((item) => _CategoryChip(data: item))
                        .toList(),
                  ),
                  const SizedBox(height: 24),
                  _SectionTitle(title: 'What\'s New!'),
                  const SizedBox(height: 10),
                  SizedBox(
                    height: 132,
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: List.generate(whatsNewCards.length, (index) {
                          final item = whatsNewCards[index];
                          return Padding(
                            padding: EdgeInsets.only(
                              right: index == whatsNewCards.length - 1 ? 0 : 10,
                            ),
                            child: _WhatsNewCard(
                              data: item,
                              width: isWide ? 320 : constraints.maxWidth * 0.82,
                            ),
                          );
                        }),
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Center(
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: List.generate(
                        7,
                        (index) => Container(
                          width: 5,
                          height: 5,
                          margin: const EdgeInsets.symmetric(horizontal: 2),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: index == 3
                                ? colorScheme.primary
                                : colorScheme.outlineVariant,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _SectionTitle(title: '$currentYear Forecast'),
                      TextButton(
                        onPressed: () => _handleModuleTap(
                          context,
                          'Career Guidance',
                        ),
                        child: const Text('See all'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    height: 160,
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: List.generate(forecastCards.length, (index) {
                          return Padding(
                            padding: EdgeInsets.only(
                              right: index == forecastCards.length - 1 ? 0 : 12,
                            ),
                            child: _ForecastCard(
                              data: forecastCards[index],
                              width: isWide ? 360 : constraints.maxWidth * 0.9,
                              onTap: () =>
                                  _handleModuleTap(context, 'Career Guidance'),
                            ),
                          );
                        }),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  _SectionTitle(title: 'Quick Actions'),
                  const SizedBox(height: 12),
                  GridView.builder(
                    itemCount: modules.length,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: isWide ? 3 : 2,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 4 / 3,
                    ),
                    itemBuilder: (context, index) {
                      final module = modules[index];
                      return _ModuleCard(
                        title: module,
                        onTap: () => _handleModuleTap(context, module),
                      );
                    },
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;

  const _SectionTitle({required this.title});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Text(
      title,
      style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.w700,
            color: colorScheme.onSurface,
          ),
    );
  }
}

class _HeroCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final String timing;
  final VoidCallback onTap;

  const _HeroCard({
    required this.title,
    required this.subtitle,
    required this.timing,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final colorScheme = Theme.of(context).colorScheme;
    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: onTap,
      child: Ink(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(14),
          gradient: LinearGradient(
            colors: [colorScheme.primary, colorScheme.tertiary],
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Explore the latest planet shifts!',
              style: textTheme.bodySmall?.copyWith(
                color: colorScheme.onPrimary.withOpacity(0.8),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              style: textTheme.headlineSmall?.copyWith(
                color: colorScheme.onPrimary,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 18),
            Row(
              children: [
                CircleAvatar(
                  radius: 18,
                  backgroundColor: colorScheme.primaryContainer,
                  child: Icon(Icons.mic_none, color: colorScheme.onPrimaryContainer),
                ),
                const SizedBox(width: 10),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      timing,
                      style: textTheme.titleSmall?.copyWith(
                        color: colorScheme.onPrimary,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    Text(
                      subtitle,
                      style: textTheme.bodyMedium?.copyWith(
                        color: colorScheme.onPrimary.withOpacity(0.9),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _ResponsiveInfoCardsGrid extends StatelessWidget {
  final List<_InfoCardData> cards;
  final double maxWidth;

  const _ResponsiveInfoCardsGrid({
    required this.cards,
    required this.maxWidth,
  });

  @override
  Widget build(BuildContext context) {
    final crossAxisCount = maxWidth >= 700 ? 3 : 2;
    return GridView.builder(
      itemCount: cards.length,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossAxisCount,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: crossAxisCount == 3 ? 1.45 : 1.05,
      ),
      itemBuilder: (context, index) => _InfoCard(data: cards[index]),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final _InfoCardData data;

  const _InfoCard({required this.data});

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final colorScheme = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: colorScheme.outlineVariant,
        ),
      ),
      child: Stack(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: colorScheme.secondaryContainer,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  data.badge,
                  style: textTheme.labelSmall?.copyWith(
                    color: colorScheme.onSecondaryContainer,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                data.title,
                style: textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                data.subtitle,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: textTheme.bodySmall?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
          if (data.showDot)
            Positioned(
              top: 2,
              right: 2,
              child: CircleAvatar(
                radius: 3,
                backgroundColor: colorScheme.error,
              ),
            ),
        ],
      ),
    );
  }
}

class _CategoryChip extends StatelessWidget {
  final _CategoryChipData data;

  const _CategoryChip({required this.data});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: colorScheme.outlineVariant,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(data.icon, size: 16, color: colorScheme.primary),
          const SizedBox(width: 6),
          Text(data.label),
        ],
      ),
    );
  }
}

class _WhatsNewCard extends StatelessWidget {
  final _BannerCardData data;
  final double? width;

  const _WhatsNewCard({
    required this.data,
    this.width,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Container(
      width: width ?? 300,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        gradient: LinearGradient(colors: data.colors),
        border: Border.all(
          color: colorScheme.outlineVariant,
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              data.title,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    color: colorScheme.onPrimary,
                    fontWeight: FontWeight.w800,
                    height: 1.2,
                  ),
            ),
          ),
          const SizedBox(width: 8),
          Icon(
            Icons.favorite,
            color: colorScheme.onPrimary.withOpacity(0.8),
            size: 34,
          ),
        ],
      ),
    );
  }
}

class _ForecastCard extends StatelessWidget {
  final _ForecastCardData data;
  final VoidCallback onTap;
  final double? width;

  const _ForecastCard({
    required this.data,
    required this.onTap,
    this.width,
  });

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final colorScheme = Theme.of(context).colorScheme;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        width: width ?? 280,
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: colorScheme.surface,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: colorScheme.outlineVariant,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 92,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                gradient: LinearGradient(
                  colors: [colorScheme.secondary, colorScheme.tertiary],
                ),
              ),
              child: Center(
                child: Icon(
                  Icons.auto_stories,
                  color: colorScheme.onSecondary,
                  size: 28,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    data.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(
                        Icons.visibility_outlined,
                        size: 14,
                        color: colorScheme.onSurfaceVariant,
                      ),
                      const SizedBox(width: 4),
                      Text(data.views, style: textTheme.bodySmall),
                      const SizedBox(width: 10),
                      Icon(
                        Icons.favorite_border,
                        size: 14,
                        color: colorScheme.onSurfaceVariant,
                      ),
                      const SizedBox(width: 4),
                      Text(data.likes, style: textTheme.bodySmall),
                    ],
                  ),
                ],
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

  IconData _iconForTitle(String value) {
    switch (value) {
      case 'My Josiyam':
        return Icons.person_search_outlined;
      case 'Couple Josiyam':
        return Icons.favorite_border_rounded;
      case 'Career Guidance':
        return Icons.work_outline_rounded;
      case 'Health Insights':
        return Icons.monitor_heart_outlined;
      case 'Wealth & Finance':
        return Icons.account_balance_wallet_outlined;
      case 'Family & Relationships':
        return Icons.family_restroom_outlined;
      default:
        return Icons.auto_awesome;
    }
  }

  String _subtitleForTitle(String value) {
    switch (value) {
      case 'My Josiyam':
        return 'Personal birth-chart reading';
      case 'Couple Josiyam':
        return 'Compatibility and relationship insights';
      case 'Career Guidance':
        return 'Plan your next career move';
      case 'Health Insights':
        return 'Daily wellness and energy guidance';
      case 'Wealth & Finance':
        return 'Money timing and growth outlook';
      case 'Family & Relationships':
        return 'Harmony for loved ones';
      default:
        return 'Explore detailed astrological guidance';
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;
    final colorScheme = theme.colorScheme;
    final icon = _iconForTitle(title);
    final subtitle = _subtitleForTitle(title);

    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: onTap,
      child: Ink(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              colorScheme.primaryContainer.withOpacity(0.7),
              colorScheme.secondaryContainer.withOpacity(0.85),
            ],
          ),
          border: Border.all(
            color: colorScheme.outlineVariant,
          ),
          boxShadow: [
            BoxShadow(
              color: colorScheme.shadow.withOpacity(0.08),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: colorScheme.surface.withOpacity(0.75),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(
                    icon,
                    color: colorScheme.primary,
                    size: 20,
                  ),
                ),
                const Spacer(),
                Icon(
                  Icons.arrow_forward_rounded,
                  size: 18,
                  color: colorScheme.onSurfaceVariant,
                ),
              ],
            ),
            const Spacer(),
            Text(
              title,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: textTheme.titleMedium?.copyWith(
                color: colorScheme.onSurface,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              subtitle,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: textTheme.bodySmall?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoCardData {
  final String badge;
  final String title;
  final String subtitle;
  final bool showDot;

  const _InfoCardData({
    required this.badge,
    required this.title,
    required this.subtitle,
    this.showDot = false,
  });
}

class _CategoryChipData {
  final IconData icon;
  final String label;

  const _CategoryChipData({
    required this.icon,
    required this.label,
  });
}

class _BannerCardData {
  final String title;
  final List<Color> colors;

  const _BannerCardData({
    required this.title,
    required this.colors,
  });
}

class _ForecastCardData {
  final String title;
  final String views;
  final String likes;

  const _ForecastCardData({
    required this.title,
    required this.views,
    required this.likes,
  });
}


import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart' hide TextDirection;
import 'package:cached_network_image/cached_network_image.dart';
import '../../config/theme.dart';
import '../../viewmodels/dashboard_viewmodel.dart';
import '../../viewmodels/auth_viewmodel.dart';
import '../news/news_form_view.dart';
import '../components/shimmer_container.dart';

class DashboardOverviewView extends ConsumerWidget {
  final Function(int) onTabSelect;

  const DashboardOverviewView({
    super.key,
    required this.onTabSelect,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(dashboardViewModelProvider);
    final authState = ref.watch(authViewModelProvider);
    final isWide = MediaQuery.of(context).size.width > 768;

    final adminName = authState.profile?.fullName ?? authState.profile?.email?.split('@').first ?? "Admin";
    final todayDate = DateFormat('EEEE, MMMM d').format(DateTime.now());

    if (state.isLoading && state.topViewed.isEmpty) {
      return _buildShimmerLoading(context);
    }

    if (state.errorMessage != null && state.topViewed.isEmpty) {
      return Scaffold(
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 48, color: AppTheme.dangerColor),
                const SizedBox(height: 12),
                Text(state.errorMessage!, textAlign: TextAlign.center),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => ref.read(dashboardViewModelProvider.notifier).fetchStats(),
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: () => ref.read(dashboardViewModelProvider.notifier).fetchStats(),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: EdgeInsets.symmetric(
            horizontal: isWide ? 24.0 : 16.0,
            vertical: 24.0,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Good day,',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                          color: Color(0xFF64748B),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        adminName,
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF0F172A),
                          letterSpacing: -0.5,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.calendar_today_outlined, size: 12, color: Color(0xFF64748B)),
                        const SizedBox(width: 6),
                        Text(
                          todayDate,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF475569),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Metrics Cards Grid
              LayoutBuilder(
                builder: (context, constraints) {
                  final cardWidth = isWide
                      ? (constraints.maxWidth - 36) / 4
                      : (constraints.maxWidth - 12) / 2;

                  return Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: [
                      _buildStatCard(
                        title: 'Published',
                        value: state.publishedCount,
                        icon: Icons.public_rounded,
                        width: cardWidth,
                        trendText: 'LIVE',
                        trendColor: AppTheme.accentColor,
                        iconColor: AppTheme.accentColor,
                      ),
                      _buildStatCard(
                        title: 'Drafts',
                        value: state.draftCount,
                        icon: Icons.drafts_rounded,
                        width: cardWidth,
                        trendText: 'PENDING',
                        trendColor: AppTheme.warningColor,
                        iconColor: AppTheme.warningColor,
                      ),
                      _buildStatCard(
                        title: 'Total Views',
                        value: state.totalViews,
                        icon: Icons.visibility_rounded,
                        width: cardWidth,
                        trendText: 'POPULAR',
                        trendColor: AppTheme.infoColor,
                        iconColor: AppTheme.infoColor,
                      ),
                      _buildStatCard(
                        title: 'Categories',
                        value: state.totalCategories,
                        icon: Icons.folder_copy_rounded,
                        width: cardWidth,
                        trendText: 'SECTIONS',
                        trendColor: AppTheme.primaryColor,
                        iconColor: AppTheme.primaryColor,
                      ),
                    ],
                  );
                },
              ),
              const SizedBox(height: 32),

              // Top Viewed Articles Section
              Row(
                children: [
                  const Icon(Icons.trending_up_rounded, size: 18, color: AppTheme.primaryColor),
                  const SizedBox(width: 8),
                  const Text(
                    'Top Viewed Articles',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              if (state.topViewed.isEmpty)
                Card(
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(32),
                    alignment: Alignment.center,
                    child: Text(
                      'No published articles yet',
                      style: TextStyle(color: Colors.grey[400], fontSize: 13),
                    ),
                  ),
                )
              else
                ListView.separated(
                  padding: EdgeInsets.zero,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: state.topViewed.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 8),
                  itemBuilder: (context, index) {
                    final article = state.topViewed[index];
                    return Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF0F172A).withOpacity(0.01),
                            blurRadius: 4,
                            offset: const Offset(0, 1),
                          ),
                        ],
                      ),
                      padding: const EdgeInsets.all(12),
                      child: Row(
                        children: [
                          // Rank Badge
                          _buildRankBadge(index),
                          const SizedBox(width: 12),

                          // Article Image
                          ClipRRect(
                            borderRadius: BorderRadius.circular(6),
                            child: Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                border: Border.all(color: const Color(0xFFF1F5F9)),
                                color: const Color(0xFFF8FAFC),
                              ),
                              child: article.imageUrl != null && article.imageUrl!.isNotEmpty
                                  ? CachedNetworkImage(
                                      imageUrl: article.imageUrl!,
                                      fit: BoxFit.cover,
                                      placeholder: (context, url) => Container(color: const Color(0xFFF1F5F9)),
                                      errorWidget: (context, url, error) => const Icon(Icons.image, size: 16, color: Colors.grey),
                                    )
                                  : const Icon(Icons.image_outlined, size: 16, color: Colors.grey),
                            ),
                          ),
                          const SizedBox(width: 12),

                          // Text Info
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  article.title,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF0F172A),
                                  ),
                                ),
                                const SizedBox(height: 3),
                                Text(
                                  '${article.categoryName ?? 'Uncategorized'} · ${DateFormat.yMd().format(article.createdAt)}',
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: Color(0xFF64748B),
                                  ),
                                ),
                              ],
                            ),
                          ),

                          // View Count Indicator
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.visibility_outlined, size: 12, color: Color(0xFF64748B)),
                                const SizedBox(width: 4),
                                Text(
                                  '${article.viewCount}',
                                  style: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF475569),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),

                          // Edit shortcut
                          IconButton(
                            icon: const Icon(Icons.edit_outlined, size: 18),
                            color: const Color(0xFF64748B),
                            visualDensity: VisualDensity.compact,
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => NewsFormView(initialArticle: article),
                                ),
                              );
                            },
                          ),
                        ],
                      ),
                    );
                  },
                ),
              const SizedBox(height: 28),

              // Quick Actions
              const Text(
                'Quick Actions',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF0F172A),
                ),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _buildActionButton(
                    icon: Icons.add_outlined,
                    label: 'New Article',
                    isPrimary: true,
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const NewsFormView()),
                      );
                    },
                  ),
                  _buildActionButton(
                    icon: Icons.folder_outlined,
                    label: 'Categories',
                    isPrimary: false,
                    onPressed: () => onTabSelect(2), // Categories is index 2
                  ),
                  _buildActionButton(
                    icon: Icons.campaign_outlined,
                    label: 'Ads',
                    isPrimary: false,
                    onPressed: () => onTabSelect(3), // Ads is index 3
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard({
    required String title,
    required int value,
    required IconData icon,
    required double width,
    required String trendText,
    required Color trendColor,
    required Color iconColor,
  }) {
    return Container(
      width: width,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0F172A).withOpacity(0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                width: 36,
                height: 36,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: iconColor.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, size: 18, color: iconColor),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: trendColor.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  trendText,
                  style: TextStyle(
                    color: trendColor,
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            title,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Color(0xFF64748B),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            NumberFormat().format(value),
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Color(0xFF0F172A),
              letterSpacing: -0.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required bool isPrimary,
    required VoidCallback onPressed,
  }) {
    return InkWell(
      onTap: onPressed,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: isPrimary ? const Color(0xFF0F172A) : Colors.white,
          border: Border.all(
            color: isPrimary ? Colors.transparent : const Color(0xFFE2E8F0),
          ),
          borderRadius: BorderRadius.circular(8),
          boxShadow: isPrimary
              ? [
                  BoxShadow(
                    color: const Color(0xFF0F172A).withOpacity(0.1),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ]
              : [],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 16,
              color: isPrimary ? Colors.white : const Color(0xFF475569),
            ),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: isPrimary ? Colors.white : const Color(0xFF475569),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRankBadge(int index) {
    Color bgColor;
    Color textColor;

    if (index == 0) {
      bgColor = const Color(0xFFFEF3C7); // Amber 100
      textColor = const Color(0xFFD97706); // Amber 600
    } else if (index == 1) {
      bgColor = const Color(0xFFF1F5F9); // Slate 100
      textColor = const Color(0xFF475569); // Slate 600
    } else if (index == 2) {
      bgColor = const Color(0xFFFFEDD5); // Orange 100
      textColor = const Color(0xFFEA580C); // Orange 600
    } else {
      bgColor = const Color(0xFFF8FAFC); // Slate 50
      textColor = const Color(0xFF94A3B8); // Slate 400
    }

    return Container(
      width: 28,
      height: 28,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(
          color: index < 3 ? textColor.withOpacity(0.2) : Colors.transparent,
          width: 1,
        ),
      ),
      child: index == 0
          ? const Icon(Icons.emoji_events_rounded, size: 14, color: Color(0xFFD97706))
          : Text(
              '${index + 1}',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: textColor,
              ),
            ),
    );
  }

  Widget _buildShimmerLoading(BuildContext context) {
    final isWide = MediaQuery.of(context).size.width > 768;

    return Scaffold(
      body: SingleChildScrollView(
        physics: const NeverScrollableScrollPhysics(),
        padding: EdgeInsets.symmetric(
          horizontal: isWide ? 24.0 : 16.0,
          vertical: 24.0,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Shimmer
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ShimmerContainer(width: 140, height: 28, borderRadius: 6),
                SizedBox(height: 8),
                ShimmerContainer(width: 220, height: 14, borderRadius: 4),
              ],
            ),
            const SizedBox(height: 24),

            // Metrics Cards Grid Shimmer
            LayoutBuilder(
              builder: (context, constraints) {
                final cardWidth = isWide
                    ? (constraints.maxWidth - 36) / 4
                    : (constraints.maxWidth - 12) / 2;

                return Wrap(
                  spacing: 12,
                  runSpacing: 12,
                  children: List.generate(4, (index) => _buildStatCardShimmer(cardWidth)),
                );
              },
            ),
            const SizedBox(height: 32),

            // Top Viewed Articles Title
            const ShimmerContainer(width: 160, height: 18, borderRadius: 4),
            const SizedBox(height: 12),

            // Top Viewed Articles List Shimmer
            ListView.separated(
              padding: EdgeInsets.zero,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: 4,
              separatorBuilder: (context, index) => const SizedBox(height: 8),
              itemBuilder: (context, index) => _buildArticleItemShimmer(),
            ),
            const SizedBox(height: 24),

            // Quick Actions Title
            const ShimmerContainer(width: 110, height: 18, borderRadius: 4),
            const SizedBox(height: 12),

            // Quick Actions Shimmer
            const Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                ShimmerContainer(width: 120, height: 40, borderRadius: 8),
                ShimmerContainer(width: 120, height: 40, borderRadius: 8),
                ShimmerContainer(width: 120, height: 40, borderRadius: 8),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCardShimmer(double width) {
    return Container(
      width: width,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      padding: const EdgeInsets.all(16),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              ShimmerContainer(width: 28, height: 28, borderRadius: 6),
              SizedBox(width: 8),
              ShimmerContainer(width: 80, height: 12, borderRadius: 3),
            ],
          ),
          SizedBox(height: 16),
          ShimmerContainer(width: 60, height: 24, borderRadius: 4),
        ],
      ),
    );
  }

  Widget _buildArticleItemShimmer() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      padding: const EdgeInsets.all(12),
      child: const Row(
        children: [
          ShimmerContainer(width: 32, height: 32, borderRadius: 6),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ShimmerContainer(width: 160, height: 12, borderRadius: 3),
                SizedBox(height: 6),
                ShimmerContainer(width: 100, height: 9, borderRadius: 2),
              ],
            ),
          ),
          SizedBox(width: 12),
          ShimmerContainer(width: 44, height: 12, borderRadius: 3),
          SizedBox(width: 12),
          ShimmerContainer(width: 28, height: 28, borderRadius: 14),
        ],
      ),
    );
  }
}

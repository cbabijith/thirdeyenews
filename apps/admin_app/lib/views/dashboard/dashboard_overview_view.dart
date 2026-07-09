import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart' hide TextDirection;
import '../../config/theme.dart';
import '../../viewmodels/dashboard_viewmodel.dart';
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
    final isWide = MediaQuery.of(context).size.width > 768;

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
              // Header
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Dashboard',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.lightTextPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Content performance overview',
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.grey[600],
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
                        icon: Icons.description_outlined,
                        width: cardWidth,
                      ),
                      _buildStatCard(
                        title: 'Drafts',
                        value: state.draftCount,
                        icon: Icons.inbox_outlined,
                        width: cardWidth,
                      ),
                      _buildStatCard(
                        title: 'Total Views',
                        value: state.totalViews,
                        icon: Icons.visibility_outlined,
                        width: cardWidth,
                      ),
                      _buildStatCard(
                        title: 'Categories',
                        value: state.totalCategories,
                        icon: Icons.folder_outlined,
                        width: cardWidth,
                      ),
                    ],
                  );
                },
              ),
              const SizedBox(height: 32),

              // Top Viewed Articles Section
              const Text(
                'Top Viewed Articles',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.lightTextPrimary,
                ),
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
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      padding: const EdgeInsets.all(12),
                      child: Row(
                        children: [
                          // Rank Circle
                          Container(
                            width: 32,
                            height: 32,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: const Color(0xFFF8FAFC),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              '${index + 1}',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: Colors.grey[400],
                              ),
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
                                    color: AppTheme.lightTextPrimary,
                                  ),
                                ),
                                const SizedBox(height: 3),
                                Text(
                                  '${article.categoryName ?? 'Uncategorized'} · ${DateFormat.yMd().format(article.createdAt)}',
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: Colors.grey[500],
                                  ),
                                ),
                              ],
                            ),
                          ),

                          // View Count Indicator
                          Row(
                            children: [
                              Icon(Icons.visibility_outlined, size: 14, color: Colors.grey[400]),
                              const SizedBox(width: 4),
                              Text(
                                '${article.viewCount}',
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                  color: Color(0xFF475569),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(width: 8),

                          // Edit shortcut
                          IconButton(
                            icon: const Icon(Icons.edit_outlined, size: 18),
                            color: Colors.grey[400],
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
              const SizedBox(height: 24),

              // Quick Actions
              const Text(
                'Quick Actions',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.lightTextPrimary,
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
  }) {
    return Container(
      width: width,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 28,
                height: 28,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Icon(icon, size: 14, color: const Color(0xFF64748B)),
              ),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: Color(0xFF64748B),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            NumberFormat().format(value),
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppTheme.lightTextPrimary,
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
    return TextButton.icon(
      style: TextButton.styleFrom(
        backgroundColor: isPrimary ? const Color(0xFF0F172A) : Colors.white,
        foregroundColor: isPrimary ? Colors.white : const Color(0xFF334155),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
          side: isPrimary
              ? BorderSide.none
              : const BorderSide(color: Color(0xFFE2E8F0)),
        ),
      ),
      onPressed: onPressed,
      icon: Icon(icon, size: 16),
      label: Text(
        label,
        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
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

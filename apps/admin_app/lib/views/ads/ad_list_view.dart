import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../viewmodels/ad_viewmodel.dart';
import '../../config/theme.dart';
import 'ad_form_view.dart';
import '../components/shimmer_container.dart';
import '../../viewmodels/auth_viewmodel.dart';

class AdListView extends ConsumerWidget {
  const AdListView({super.key});

  void _confirmDelete(BuildContext context, String title, VoidCallback onDelete) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Advertisement?'),
        content: Text('Are you sure you want to delete "$title"? This cannot be undone.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          TextButton(
            onPressed: () {
              onDelete();
              Navigator.pop(context);
            },
            child: const Text('Delete', style: TextStyle(color: AppTheme.dangerColor)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final adState = ref.watch(adViewModelProvider);
    final notifier = ref.read(adViewModelProvider.notifier);
    final userProfile = ref.watch(authViewModelProvider).profile;
    final isSuperAdmin = userProfile?.isSuperAdmin ?? false;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textPrimary = isDark ? AppTheme.darkTextPrimary : AppTheme.lightTextPrimary;
    final textSecondary = isDark ? AppTheme.darkTextSecondary : AppTheme.lightTextSecondary;
    final borderColor = isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0);
    final containerBg = isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC);

    if (adState.isLoading) {
      return _buildAdShimmer(context);
    }

    final activeCount = adState.ads.where((a) => a.isActive).length;

    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: const Color(0xFFFEE2E2),
        foregroundColor: AppTheme.primaryColor,
        elevation: 4,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const AdFormView()),
          );
        },
        icon: const Icon(Icons.add_to_photos_outlined, size: 20),
        label: const Text(
          'Create Ad',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 0.3),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Stats (Web aligned)
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Ads',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: textPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${adState.ads.length} ads • $activeCount active',
                      style: const TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Info Banner (Web aligned)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: containerBg, // Slate 50
                border: Border.all(color: borderColor), // Slate 200
                borderRadius: BorderRadius.circular(8),
              ),
              child: RichText(
                text: TextSpan(
                  style: TextStyle(
                    fontSize: 11,
                    color: textSecondary, // Slate 500
                    height: 1.4,
                  ),
                  children: [
                    TextSpan(
                      text: 'Main Banner',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF334155), // Slate 700
                      ),
                    ),
                    TextSpan(text: ' — home & news pages (2-3 recommended). '),
                    TextSpan(
                      text: 'Bottom Nav',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF334155),
                      ),
                    ),
                    TextSpan(text: ' — mobile bottom bar (1 active only).'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Ads List Content
            Expanded(
              child: adState.ads.isEmpty
                  ? const Center(child: Text('No advertisements found.'))
                  : ListView.builder(
                      padding: EdgeInsets.zero,
                      itemCount: adState.ads.length,
                      itemBuilder: (context, index) {
                        final ad = adState.ads[index];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 16),
                          elevation: 0.5,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                            side: const BorderSide(color: Color(0xFFE2E8F0)),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(14.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    // Premium Square-ish Thumbnail (Web aligned)
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(8),
                                      child: SizedBox(
                                        width: 100,
                                        height: 100,
                                        child: CachedNetworkImage(
                                          imageUrl: ad.imageUrl,
                                          fit: BoxFit.cover,
                                          placeholder: (context, url) => Container(
                                            color: Colors.grey[200],
                                          ),
                                          errorWidget: (context, url, error) =>
                                              const Icon(
                                            Icons.broken_image,
                                            color: Colors.grey,
                                          ),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 16),

                                    // Content Panel
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          // Badge Tags (Web aligned)
                                          Wrap(
                                            spacing: 6,
                                            runSpacing: 4,
                                            crossAxisAlignment:
                                                WrapCrossAlignment.center,
                                            children: [
                                              Container(
                                                padding:
                                                    const EdgeInsets.symmetric(
                                                  horizontal: 6,
                                                  vertical: 2,
                                                ),
                                                decoration: BoxDecoration(
                                                  color: ad.isActive
                                                      ? const Color(0xFFF0FDF4)
                                                      : const Color(0xFFFEF9C3),
                                                  borderRadius:
                                                      BorderRadius.circular(4),
                                                ),
                                                child: Text(
                                                  ad.isActive
                                                      ? 'ACTIVE'
                                                      : 'INACTIVE',
                                                  style: TextStyle(
                                                    fontSize: 9,
                                                    fontWeight: FontWeight.bold,
                                                    color: ad.isActive
                                                        ? const Color(0xFF16A34A)
                                                        : const Color(
                                                            0xFFB45309,
                                                          ),
                                                  ),
                                                ),
                                              ),
                                              Container(
                                                padding:
                                                    const EdgeInsets.symmetric(
                                                  horizontal: 6,
                                                  vertical: 2,
                                                ),
                                                decoration: BoxDecoration(
                                                  color:
                                                      const Color(0xFFF1F5F9),
                                                  borderRadius:
                                                      BorderRadius.circular(4),
                                                ),
                                                child: Text(
                                                  ad.position == 'main_banner'
                                                      ? 'MAIN BANNER'
                                                      : 'BOTTOM NAV',
                                                  style: const TextStyle(
                                                    fontSize: 9,
                                                    fontWeight: FontWeight.bold,
                                                    color: Color(0xFF475569),
                                                  ),
                                                ),
                                              ),
                                              Text(
                                                'Order: ${ad.displayOrder}',
                                                style: const TextStyle(
                                                  fontSize: 10,
                                                  color: Colors.grey,
                                                  fontWeight: FontWeight.w500,
                                                ),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 8),
                                          Text(
                                            ad.title,
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 14,
                                              color: textPrimary,
                                            ),
                                          ),
                                          if (ad.linkUrl != null &&
                                              ad.linkUrl!.isNotEmpty) ...[
                                            const SizedBox(height: 6),
                                            InkWell(
                                              onTap: () async {
                                                final uri = Uri.parse(
                                                  ad.linkUrl!,
                                                );
                                                if (await canLaunchUrl(uri)) {
                                                  await launchUrl(
                                                    uri,
                                                    mode: LaunchMode
                                                        .externalApplication,
                                                  );
                                                }
                                              },
                                              child: Row(
                                                mainAxisSize: MainAxisSize.min,
                                                children: [
                                                  const Icon(
                                                    Icons.open_in_new,
                                                    size: 12,
                                                    color: Colors.blue,
                                                  ),
                                                  const SizedBox(width: 4),
                                                  Flexible(
                                                    child: Text(
                                                      ad.linkUrl!,
                                                      style: const TextStyle(
                                                        fontSize: 12,
                                                        color: Colors.blue,
                                                        decoration:
                                                            TextDecoration
                                                                .underline,
                                                      ),
                                                      overflow:
                                                          TextOverflow.ellipsis,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ],
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                const Divider(
                                  height: 20,
                                  color: Color(0xFFF1F5F9),
                                ),
                                // Bottom Actions Panel (Web aligned)
                                Row(
                                  children: [
                                    TextButton.icon(
                                      icon: Icon(
                                        ad.isActive
                                            ? Icons.power_settings_new
                                            : Icons.power_settings_new_outlined,
                                        size: 16,
                                        color: ad.isActive
                                            ? const Color(0xFFD97706)
                                            : const Color(0xFF16A34A),
                                      ),
                                      label: Text(
                                        ad.isActive ? 'Deactivate' : 'Activate',
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: ad.isActive
                                              ? const Color(0xFFD97706)
                                              : const Color(0xFF16A34A),
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                      onPressed: () =>
                                          notifier.toggleActive(ad),
                                    ),
                                    const Spacer(),
                                    TextButton.icon(
                                      icon: const Icon(
                                        Icons.edit_outlined,
                                        size: 16,
                                        color: Color(0xFF64748B),
                                      ),
                                      label: const Text(
                                        'Edit',
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: Color(0xFF475569),
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                      onPressed: () {
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                            builder: (context) =>
                                                AdFormView(initialAd: ad),
                                          ),
                                        );
                                      },
                                    ),
                                    if (isSuperAdmin) ...[
                                      const SizedBox(width: 8),
                                      TextButton.icon(
                                        icon: const Icon(
                                          Icons.delete_outline_rounded,
                                          size: 16,
                                          color: AppTheme.dangerColor,
                                        ),
                                        label: const Text(
                                          'Delete',
                                          style: TextStyle(
                                            fontSize: 12,
                                            color: AppTheme.dangerColor,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                        onPressed: () => _confirmDelete(
                                          context,
                                          ad.title,
                                          () => notifier.deleteAd(ad.id),
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAdShimmer(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Stats
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ShimmerContainer(width: 80, height: 24, borderRadius: 6),
                SizedBox(height: 8),
                ShimmerContainer(width: 120, height: 13, borderRadius: 3),
              ],
            ),
            const SizedBox(height: 16),

            // Info Banner Shimmer
            const ShimmerContainer(width: double.infinity, height: 44, borderRadius: 8),
            const SizedBox(height: 16),

            // List of Ad Cards Shimmer
            Expanded(
              child: ListView.separated(
                padding: EdgeInsets.zero,
                itemCount: 3,
                separatorBuilder: (context, index) => const SizedBox(height: 16),
                itemBuilder: (context, index) {
                  final isDark = Theme.of(context).brightness == Brightness.dark;
                  final cardBg = isDark ? AppTheme.darkSurface : Colors.white;
                  final borderColor = isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0);

                  return Container(
                    decoration: BoxDecoration(
                      color: cardBg,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: borderColor, width: 1),
                    ),
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Square image thumbnail
                            const ShimmerContainer(width: 100, height: 100, borderRadius: 8),
                            const SizedBox(width: 16),

                            // Content Details
                            const Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Badge tags
                                  Row(
                                    children: [
                                      ShimmerContainer(width: 50, height: 14, borderRadius: 4),
                                      SizedBox(width: 6),
                                      ShimmerContainer(width: 65, height: 14, borderRadius: 4),
                                      SizedBox(width: 6),
                                      ShimmerContainer(width: 35, height: 11, borderRadius: 2),
                                    ],
                                  ),
                                  SizedBox(height: 12),

                                  // Title
                                  ShimmerContainer(width: 160, height: 14, borderRadius: 3),
                                  SizedBox(height: 8),

                                  // Link
                                  Row(
                                    children: [
                                      ShimmerContainer(width: 12, height: 12, borderRadius: 2),
                                      SizedBox(width: 6),
                                      ShimmerContainer(width: 120, height: 11, borderRadius: 2),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),

                        // Divider
                        const SizedBox(height: 12),
                        Container(height: 1, color: const Color(0xFFF1F5F9)),
                        const SizedBox(height: 8),

                        // Bottom Buttons Row
                        const Row(
                          children: [
                            ShimmerContainer(width: 80, height: 24, borderRadius: 6),
                            Spacer(),
                            ShimmerContainer(width: 45, height: 24, borderRadius: 6),
                            SizedBox(width: 8),
                            ShimmerContainer(width: 45, height: 24, borderRadius: 6),
                          ],
                        ),
                      ],
                    ),
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

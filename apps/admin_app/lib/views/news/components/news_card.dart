import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../models/news.dart';
import '../../../config/theme.dart';

class NewsCard extends StatelessWidget {
  final News item;
  final VoidCallback onTogglePublish;
  final VoidCallback onTogglePin;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
  final bool showDelete;

  const NewsCard({
    super.key,
    required this.item,
    required this.onTogglePublish,
    required this.onTogglePin,
    required this.onEdit,
    required this.onDelete,
    this.showDelete = true,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textPrimary = isDark ? AppTheme.darkTextPrimary : AppTheme.lightTextPrimary;
    final textSecondary = isDark ? AppTheme.darkTextSecondary : AppTheme.lightTextSecondary;
    final cardBg = isDark ? AppTheme.darkSurface : Colors.white;
    final borderColor = isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0);
    final formattedDate = DateFormat.yMMMd().format(item.createdAt);

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: borderColor, width: 1),
        boxShadow: [
          BoxShadow(
            color: isDark ? Colors.black.withValues(alpha: 0.1) : const Color(0xFF0F172A).withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Thumbnail
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                      border: Border.all(color: borderColor, width: 1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: item.imageUrl != null && item.imageUrl!.isNotEmpty
                        ? CachedNetworkImage(
                            imageUrl: item.imageUrl!,
                            fit: BoxFit.cover,
                            placeholder: (context, url) => const Center(
                              child: SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              ),
                            ),
                            errorWidget: (context, url, error) => _emptyThumbnail(context),
                          )
                        : _emptyThumbnail(context),
                  ),
                ),
                const SizedBox(width: 14),

                // Title & Details
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Category Tag & Video Badge
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryColor.withValues(alpha: 0.08),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              (item.categoryName ?? 'Uncategorized').toUpperCase(),
                              style: const TextStyle(
                                color: AppTheme.primaryColor,
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.3,
                              ),
                            ),
                          ),
                          if (item.youtubeLink != null && item.youtubeLink!.isNotEmpty) ...[
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppTheme.dangerColor.withValues(alpha: 0.08),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.play_circle_outline, size: 10, color: AppTheme.dangerColor),
                                  SizedBox(width: 2),
                                  Text(
                                    'VIDEO',
                                    style: TextStyle(
                                      color: AppTheme.dangerColor,
                                      fontSize: 9,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 8),

                      // Title
                      Text(
                        item.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                          color: textPrimary,
                          height: 1.3,
                        ),
                      ),
                      const SizedBox(height: 8),

                      // Metadata Info
                      Row(
                        children: [
                          Icon(Icons.calendar_today_outlined, size: 11, color: textSecondary),
                          const SizedBox(width: 4),
                          Text(
                            formattedDate,
                            style: TextStyle(fontSize: 11, color: textSecondary),
                          ),
                          const SizedBox(width: 12),
                          Icon(Icons.visibility_outlined, size: 12, color: textSecondary),
                          const SizedBox(width: 4),
                          Text(
                            '${item.viewCount} views',
                            style: TextStyle(fontSize: 11, color: textSecondary),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Divider
          Container(
            height: 1,
            color: borderColor,
          ),

          // Bottom Action Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 6.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Toggles
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _statePill(
                      context: context,
                      isActive: item.isPublished,
                      activeText: 'LIVE',
                      inactiveText: 'DRAFT',
                      activeIcon: Icons.public,
                      inactiveIcon: Icons.public_off,
                      activeColor: AppTheme.accentColor,
                      onTap: onTogglePublish,
                    ),
                    const SizedBox(width: 8),
                    _statePill(
                      context: context,
                      isActive: item.isPinned,
                      activeText: 'PINNED',
                      inactiveText: 'PIN',
                      activeIcon: Icons.push_pin,
                      inactiveIcon: Icons.push_pin_outlined,
                      activeColor: AppTheme.primaryColor,
                      onTap: onTogglePin,
                    ),
                  ],
                ),

                // CRUD & Share Actions
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _whatsappButton(context),
                    const SizedBox(width: 4),
                    _actionButton(
                      icon: Icons.open_in_new_outlined,
                      color: isDark ? AppTheme.darkTextSecondary : const Color(0xFF475569), // Slate 600
                      onTap: () => _viewOnWebsite(context),
                      tooltip: 'View on Site',
                    ),
                    const SizedBox(width: 4),
                    _actionButton(
                      icon: Icons.edit_outlined,
                      color: isDark ? AppTheme.darkTextSecondary : const Color(0xFF475569), // Slate 600
                      onTap: onEdit,
                      tooltip: 'Edit Article',
                    ),
                    if (showDelete) ...[
                      const SizedBox(width: 4),
                      _actionButton(
                        icon: Icons.delete_outline,
                        color: AppTheme.dangerColor,
                        onTap: onDelete,
                        tooltip: 'Delete Article',
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _emptyThumbnail(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
      child: const Icon(Icons.image_not_supported_outlined, color: Color(0xFF94A3B8), size: 28),
    );
  }

  Widget _statePill({
    required BuildContext context,
    required bool isActive,
    required String activeText,
    required String inactiveText,
    required IconData activeIcon,
    required IconData inactiveIcon,
    required Color activeColor,
    required VoidCallback onTap,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final color = isActive ? activeColor : (isDark ? AppTheme.darkTextSecondary : const Color(0xFF64748B)); // Slate 500
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(6),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: color.withValues(alpha: 0.15)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(isActive ? activeIcon : inactiveIcon, size: 12, color: color),
            const SizedBox(width: 4),
            Text(
              isActive ? activeText : inactiveText,
              style: TextStyle(
                color: color,
                fontSize: 10,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.3,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _actionButton({
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
    required String tooltip,
  }) {
    return Tooltip(
      message: tooltip,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.08),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, size: 18, color: color),
        ),
      ),
    );
  }

  Widget _whatsappButton(BuildContext context) {
    return Tooltip(
      message: 'Share on WhatsApp',
      child: InkWell(
        onTap: () => _shareToWhatsApp(context),
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: const Color(0xFF25D366).withValues(alpha: 0.08),
            shape: BoxShape.circle,
          ),
          child: SvgPicture.string(
            '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
              <path fill="#25D366" d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.16 5.348 5.497.01 12.053 0c3.183.001 6.177 1.24 8.43 3.496a11.905 11.905 0 0 1 3.483 8.423c-.005 6.544-5.342 11.884-11.898 11.884h-.004c-1.995 0-3.953-.516-5.698-1.503L0 24zm6.59-2.631c1.554.922 3.19 1.408 4.887 1.409h.003c5.385 0 9.767-4.372 9.77-9.743a9.75 9.75 0 0 0-2.859-6.892A9.752 9.752 0 0 0 12.052 3.32c-5.383 0-9.767 4.376-9.77 9.745-.001 1.83.479 3.619 1.391 5.178l-.348 1.272 1.322-.346zm11.485-7.403c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            </svg>'''
          ),
        ),
      ),
    );
  }

  String _normalizeMalayalam(String text) {
    return text
        .replaceAll('\u0D23\u0D4D\u200D', '\u0D7A') // ണ + ് + ZWJ -> ൺ
        .replaceAll('\u0D28\u0D4D\u200D', '\u0D7B') // ന + ് + ZWJ -> ൻ
        .replaceAll('\u0D30\u0D4D\u200D', '\u0D7C') // ര + ് + ZWJ -> ർ
        .replaceAll('\u0D32\u0D4D\u200D', '\u0D7D') // ല + ് + ZWJ -> ൽ
        .replaceAll('\u0D33\u0D4D\u200D', '\u0D7E'); // ള + ് + ZWJ -> ൾ
  }

  Future<void> _shareToWhatsApp(BuildContext context) async {
    final title = _normalizeMalayalam(item.title);
    final boldTitle = title
        .split('\n')
        .map((line) => line.trim())
        .where((line) => line.isNotEmpty)
        .map((line) => '*$line*')
        .join('\n');

    final linkIdentifier = item.slug != null && item.slug!.trim().isNotEmpty ? item.slug!.trim() : item.id;
    final newsUrl = 'https://thirdeyenewslive.com/news/$linkIdentifier';

    final shareText = '$boldTitle\n\n$newsUrl\n\n🔴 വാർത്തകൾ ഡെയ്ലി ഹണ്ടിൽ വായിക്കുവാൻ ഇവിടെ ക്ലിക്ക് ചെയ്യുക\nhttps://profile.dailyhunt.in/thirdeyenewslive\n\n📢 വാർത്തകൾ വാട്സ് ആപ്പിൽ അതിവേഗമറിയാൻ ഇവിടെ ക്ലിക്ക് ചെയ്യുക\nhttps://chat.whatsapp.com/EDpxcoLm36sGvoGLYlv4b9';

    final whatsappUrl = Uri.parse('https://wa.me/?text=${Uri.encodeComponent(shareText)}');
    try {
      final launched = await launchUrl(whatsappUrl, mode: LaunchMode.externalApplication);
      if (!launched) {
        final customSchemeUrl = Uri.parse('whatsapp://send?text=${Uri.encodeComponent(shareText)}');
        await launchUrl(customSchemeUrl, mode: LaunchMode.externalApplication);
      }
    } catch (_) {
      try {
        final customSchemeUrl = Uri.parse('whatsapp://send?text=${Uri.encodeComponent(shareText)}');
        await launchUrl(customSchemeUrl, mode: LaunchMode.externalApplication);
      } catch (_) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Could not open WhatsApp.')),
          );
        }
      }
    }
  }

  Future<void> _viewOnWebsite(BuildContext context) async {
    final linkIdentifier = item.slug != null && item.slug!.trim().isNotEmpty ? item.slug!.trim() : item.id;
    final url = Uri.parse('https://thirdeyenewslive.com/news/$linkIdentifier');
    try {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open website.')),
        );
      }
    }
  }
}

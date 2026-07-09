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

  const NewsCard({
    super.key,
    required this.item,
    required this.onTogglePublish,
    required this.onTogglePin,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final formattedDate = DateFormat.yMMMd().format(item.createdAt);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Thumbnail
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: SizedBox(
                width: 72,
                height: 72,
                child: item.imageUrl != null && item.imageUrl!.isNotEmpty
                    ? CachedNetworkImage(
                        imageUrl: item.imageUrl!,
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Container(color: Colors.grey[200]),
                        errorWidget: (context, url, error) => _emptyThumbnail(),
                      )
                    : _emptyThumbnail(),
              ),
            ),
            const SizedBox(width: 16),

            // Metadata & Title
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Badges
                  Wrap(
                    spacing: 6,
                    runSpacing: 4,
                    children: [
                      _badge(
                        text: item.isPublished ? 'LIVE' : 'DRAFT',
                        color: item.isPublished ? AppTheme.accentColor : AppTheme.warningColor,
                      ),
                      if (item.isPinned)
                        _badge(
                          text: 'PINNED',
                          color: AppTheme.primaryColor,
                          icon: Icons.push_pin_outlined,
                        ),
                      if (item.youtubeLink != null && item.youtubeLink!.isNotEmpty)
                        _badge(
                          text: 'VIDEO',
                          color: AppTheme.dangerColor,
                          icon: Icons.play_circle_outline,
                        ),
                      _badge(
                        text: '${item.viewCount} views',
                        color: Colors.grey,
                        icon: Icons.visibility_outlined,
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  // Title
                  Text(
                    item.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  const SizedBox(height: 4),
                  // Category & Date
                  Text(
                    '${item.categoryName ?? 'Uncategorized'} · $formattedDate',
                    style: const TextStyle(fontSize: 11, color: Colors.grey),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),

            // Quick Actions
            Column(
              children: [
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      icon: Icon(
                        Icons.public_outlined,
                        color: item.isPublished ? Colors.amber : Colors.green,
                        size: 20,
                      ),
                      tooltip: item.isPublished ? 'Unpublish' : 'Publish',
                      onPressed: onTogglePublish,
                    ),
                    IconButton(
                      icon: Icon(
                        Icons.push_pin_outlined,
                        color: item.isPinned ? AppTheme.primaryColor : Colors.grey,
                        size: 20,
                      ),
                      tooltip: item.isPinned ? 'Unpin' : 'Pin',
                      onPressed: onTogglePin,
                    ),
                  ],
                ),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      icon: SvgPicture.string(
                        '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                          <path fill="#25D366" d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.16 5.348 5.497.01 12.053 0c3.183.001 6.177 1.24 8.43 3.496a11.905 11.905 0 0 1 3.483 8.423c-.005 6.544-5.342 11.884-11.898 11.884h-.004c-1.995 0-3.953-.516-5.698-1.503L0 24zm6.59-2.631c1.554.922 3.19 1.408 4.887 1.409h.003c5.385 0 9.767-4.372 9.77-9.743a9.75 9.75 0 0 0-2.859-6.892A9.752 9.752 0 0 0 12.052 3.32c-5.383 0-9.767 4.376-9.77 9.745-.001 1.83.479 3.619 1.391 5.178l-.348 1.272 1.322-.346zm11.485-7.403c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                        </svg>'''
                      ),
                      tooltip: 'Share on WhatsApp',
                      onPressed: () => _shareToWhatsApp(context),
                    ),
                    IconButton(
                      icon: const Icon(Icons.edit_outlined, size: 20),
                      tooltip: 'Edit',
                      onPressed: onEdit,
                    ),
                    IconButton(
                      icon: const Icon(Icons.delete_outline, color: AppTheme.dangerColor, size: 20),
                      tooltip: 'Delete',
                      onPressed: onDelete,
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

  Future<void> _shareToWhatsApp(BuildContext context) async {
    final category = item.categoryName ?? 'ബ്രേക്കിംഗ് ന്യൂസ്';
    final newsUrl = 'https://www.thirdeyenews.com/news/${item.id}';
    final formattedDate = DateFormat.yMMMd().format(item.createdAt);

    final shareText = '''📰 *ThirdEye News* | $category

✍️ *${item.title}*

👉 *മുഴുവൻ വാർത്ത വായിക്കാൻ:*
$newsUrl

📅 $formattedDate

━━━━━━━━━━━━━━━

📲 *ThirdEye News വാട്സ്ആപ്പ് ചാനലിൽ ചേരൂ*

കേരളത്തിലെയും ലോകത്തെയും പ്രധാന വാർത്തകൾ, ബ്രേക്കിംഗ് അപ്ഡേറ്റുകൾ, പ്രത്യേക റിപ്പോർട്ടുകൾ എന്നിവ അതിവേഗം ലഭിക്കാൻ ഞങ്ങളുടെ വാട്സ്ആപ്പ് ചാനലിൽ ഇപ്പോൾ തന്നെ ജോയിൻ ചെയ്യൂ

👇 *ചാനലിൽ ചേരാൻ*
https://chat.whatsapp.com/B6JGw1jqCMeFBABRYql9MV?mode=ems_copy_t

━━━━━━━━━━━━━━━
*ThirdEye News*
സത്യസന്ധവും വേഗമേറിയതുമായ വാർത്തകൾ 🌐 www.thirdeyenews.com''';

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

  Widget _emptyThumbnail() {
    return Container(
      color: Colors.grey[100],
      child: const Icon(Icons.image_not_supported_outlined, color: Colors.grey, size: 32),
    );
  }

  Widget _badge({required String text, required Color color, IconData? icon}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 10, color: color),
            const SizedBox(width: 2),
          ],
          Text(
            text.toUpperCase(),
            style: TextStyle(
              color: color,
              fontSize: 9,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}

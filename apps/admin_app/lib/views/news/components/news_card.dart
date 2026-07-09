import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:cached_network_image/cached_network_image.dart';
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

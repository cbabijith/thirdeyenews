class News {
  final String id;
  final String title;
  final String content;
  final String? description;
  final String? imageUrl;
  final String? youtubeLink;
  final String? categoryId;
  final String? subcategoryId;
  final String? slug;
  final String? adImageUrl;
  final String? adLinkUrl;
  final String? createdBy;
  final bool isPublished;
  final bool isPinned;
  final DateTime? publishedAt;
  final int viewCount;
  final DateTime createdAt;
  final String? categoryName; // Helper for UI display

  News({
    required this.id,
    required this.title,
    required this.content,
    this.description,
    this.imageUrl,
    this.youtubeLink,
    this.categoryId,
    this.subcategoryId,
    this.slug,
    this.adImageUrl,
    this.adLinkUrl,
    this.createdBy,
    this.isPublished = false,
    this.isPinned = false,
    this.publishedAt,
    this.viewCount = 0,
    required this.createdAt,
    this.categoryName,
  });

  factory News.fromJson(Map<String, dynamic> json) {
    // Check if category name is nested from supabase join
    String? catName;
    if (json['categories'] != null) {
      if (json['categories'] is Map) {
        catName = json['categories']['name'] as String?;
      }
    }

    return News(
      id: json['id'] as String,
      title: json['title'] as String? ?? '',
      content: json['content'] as String? ?? '',
      description: json['description'] as String?,
      imageUrl: json['image_url'] as String?,
      youtubeLink: json['youtube_link'] as String?,
      categoryId: json['category_id'] as String?,
      subcategoryId: json['subcategory_id'] as String?,
      slug: json['slug'] as String?,
      adImageUrl: json['ad_image_url'] as String?,
      adLinkUrl: json['ad_link_url'] as String?,
      createdBy: json['created_by'] as String?,
      isPublished: json['is_published'] as bool? ?? false,
      isPinned: json['is_pinned'] as bool? ?? false,
      publishedAt: json['published_at'] != null 
          ? DateTime.tryParse(json['published_at'] as String) 
          : null,
      viewCount: json['view_count'] as int? ?? 0,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'] as String) ?? DateTime.now()
          : DateTime.now(),
      categoryName: catName ?? json['category_name'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'content': content,
      'description': description,
      'image_url': imageUrl,
      'youtube_link': youtubeLink,
      'category_id': categoryId,
      'subcategory_id': subcategoryId,
      'slug': slug,
      'ad_image_url': adImageUrl,
      'ad_link_url': adLinkUrl,
      'is_published': isPublished,
      'is_pinned': isPinned,
      if (publishedAt != null) 'published_at': publishedAt!.toIso8601String(),
    };
  }

  News copyWith({
    String? id,
    String? title,
    String? content,
    String? description,
    String? imageUrl,
    String? youtubeLink,
    String? categoryId,
    String? subcategoryId,
    String? slug,
    String? adImageUrl,
    String? adLinkUrl,
    String? createdBy,
    bool? isPublished,
    bool? isPinned,
    DateTime? publishedAt,
    int? viewCount,
    DateTime? createdAt,
    String? categoryName,
  }) {
    return News(
      id: id ?? this.id,
      title: title ?? this.title,
      content: content ?? this.content,
      description: description ?? this.description,
      imageUrl: imageUrl ?? this.imageUrl,
      youtubeLink: youtubeLink ?? this.youtubeLink,
      categoryId: categoryId ?? this.categoryId,
      subcategoryId: subcategoryId ?? this.subcategoryId,
      slug: slug ?? this.slug,
      adImageUrl: adImageUrl ?? this.adImageUrl,
      adLinkUrl: adLinkUrl ?? this.adLinkUrl,
      createdBy: createdBy ?? this.createdBy,
      isPublished: isPublished ?? this.isPublished,
      isPinned: isPinned ?? this.isPinned,
      publishedAt: publishedAt ?? this.publishedAt,
      viewCount: viewCount ?? this.viewCount,
      createdAt: createdAt ?? this.createdAt,
      categoryName: categoryName ?? this.categoryName,
    );
  }
}

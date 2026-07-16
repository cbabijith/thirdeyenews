class Ad {
  final String id;
  final String title;
  final String imageUrl;
  final String? linkUrl;
  final String? youtubeLink;
  final String position; // 'main_banner' | 'bottom_nav'
  final bool isActive;
  final int displayOrder;
  final DateTime createdAt;

  Ad({
    required this.id,
    required this.title,
    required this.imageUrl,
    this.linkUrl,
    this.youtubeLink,
    required this.position,
    this.isActive = true,
    this.displayOrder = 0,
    required this.createdAt,
  });

  factory Ad.fromJson(Map<String, dynamic> json) {
    return Ad(
      id: json['id'] as String,
      title: json['title'] as String? ?? '',
      imageUrl: json['image_url'] as String? ?? '',
      linkUrl: json['link_url'] as String?,
      youtubeLink: json['youtube_link'] as String?,
      position: json['position'] as String? ?? 'main_banner',
      isActive: json['is_active'] as bool? ?? true,
      displayOrder: json['display_order'] as int? ?? 0,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'] as String) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'image_url': imageUrl,
      'link_url': linkUrl,
      'youtube_link': youtubeLink,
      'position': position,
      'is_active': isActive,
      'display_order': displayOrder,
    };
  }

  Ad copyWith({
    String? id,
    String? title,
    String? imageUrl,
    String? linkUrl,
    String? youtubeLink,
    String? position,
    bool? isActive,
    int? displayOrder,
    DateTime? createdAt,
  }) {
    return Ad(
      id: id ?? this.id,
      title: title ?? this.title,
      imageUrl: imageUrl ?? this.imageUrl,
      linkUrl: linkUrl ?? this.linkUrl,
      youtubeLink: youtubeLink ?? this.youtubeLink,
      position: position ?? this.position,
      isActive: isActive ?? this.isActive,
      displayOrder: displayOrder ?? this.displayOrder,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}

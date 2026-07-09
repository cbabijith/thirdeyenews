class Subcategory {
  final String id;
  final String categoryId;
  final String name;
  final String slug;
  final String? description;

  Subcategory({
    required this.id,
    required this.categoryId,
    required this.name,
    required this.slug,
    this.description,
  });

  factory Subcategory.fromJson(Map<String, dynamic> json) {
    return Subcategory(
      id: json['id'] as String,
      categoryId: json['category_id'] as String,
      name: json['name'] as String? ?? '',
      slug: json['slug'] as String? ?? '',
      description: json['description'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'category_id': categoryId,
      'name': name,
      'slug': slug,
      'description': description,
    };
  }

  Subcategory copyWith({
    String? id,
    String? categoryId,
    String? name,
    String? slug,
    String? description,
  }) {
    return Subcategory(
      id: id ?? this.id,
      categoryId: categoryId ?? this.categoryId,
      name: name ?? this.name,
      slug: slug ?? this.slug,
      description: description ?? this.description,
    );
  }
}

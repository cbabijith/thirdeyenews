import 'dart:io';
import 'package:dio/dio.dart';
import '../config/supabase_config.dart';
import '../models/news.dart';

class NewsRepository {
  final _dio = Dio(BaseOptions(
    connectTimeout: const Duration(seconds: 15),
    receiveTimeout: const Duration(seconds: 15),
  ));

  NewsRepository(dynamic _);

  // Search and paginated list with filter and sort
  Future<Map<String, dynamic>> searchNews({
    String? searchQuery,
    String? categoryId,
    String sortBy = 'date-desc',
    required int limit,
    required int offset,
  }) async {
    final queryParams = {
      if (searchQuery != null && searchQuery.isNotEmpty) 'search': searchQuery,
      if (categoryId != null && categoryId.isNotEmpty) 'categoryId': categoryId,
      'sortBy': sortBy,
      'limit': limit.toString(),
      'offset': offset.toString(),
    };

    final response = await _dio.get(
      '${SupabaseConfig.adminApiBaseUrl}/api/news',
      queryParameters: queryParams,
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to load news: ${response.data}');
    }

    final jsonMap = response.data as Map<String, dynamic>;
    final dataList = jsonMap['data'] as List<dynamic>? ?? [];
    final count = jsonMap['count'] as int? ?? 0;

    final newsItems = dataList.map((json) => News.fromJson(json as Map<String, dynamic>)).toList();

    return {
      'data': newsItems,
      'count': count,
    };
  }

  // Fetch single news by ID
  Future<News?> getNewsById(String id) async {
    try {
      final response = await _dio.get('${SupabaseConfig.adminApiBaseUrl}/api/news/$id');
      if (response.statusCode != 200) return null;
      
      final jsonMap = response.data as Map<String, dynamic>;
      return News.fromJson(jsonMap['data'] as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }

  // Create news
  Future<News> createNews(News newsItem) async {
    final response = await _dio.post(
      '${SupabaseConfig.adminApiBaseUrl}/api/news',
      data: {
        'title': newsItem.title,
        'content': newsItem.content,
        'description': newsItem.description,
        'image_url': newsItem.imageUrl,
        'youtube_link': newsItem.youtubeLink,
        'category_id': newsItem.categoryId,
        'subcategory_id': newsItem.subcategoryId,
        'is_published': newsItem.isPublished,
        'is_pinned': newsItem.isPinned,
        'slug': newsItem.slug,
        'ad_image_url': newsItem.adImageUrl,
        'ad_link_url': newsItem.adLinkUrl,
        if (newsItem.publishedAt != null) 'published_at': newsItem.publishedAt!.toIso8601String(),
      },
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to create news: ${response.data}');
    }

    final jsonMap = response.data as Map<String, dynamic>;
    return News.fromJson(jsonMap['data'] as Map<String, dynamic>);
  }

  // Update news
  Future<News> updateNews(String id, News newsItem) async {
    final response = await _dio.patch(
      '${SupabaseConfig.adminApiBaseUrl}/api/news/$id',
      data: {
        'title': newsItem.title,
        'content': newsItem.content,
        'description': newsItem.description,
        'image_url': newsItem.imageUrl,
        'youtube_link': newsItem.youtubeLink,
        'category_id': newsItem.categoryId,
        'subcategory_id': newsItem.subcategoryId,
        'is_published': newsItem.isPublished,
        'is_pinned': newsItem.isPinned,
        'slug': newsItem.slug,
        'ad_image_url': newsItem.adImageUrl,
        'ad_link_url': newsItem.adLinkUrl,
        if (newsItem.publishedAt != null) 'published_at': newsItem.publishedAt!.toIso8601String(),
      },
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to update news: ${response.data}');
    }

    final jsonMap = response.data as Map<String, dynamic>;
    return News.fromJson(jsonMap['data'] as Map<String, dynamic>);
  }

  // Delete news
  Future<void> deleteNews(String id) async {
    final response = await _dio.delete('${SupabaseConfig.adminApiBaseUrl}/api/news/$id');
    if (response.statusCode != 200) {
      throw Exception('Failed to delete news: ${response.data}');
    }
  }

  // Toggle publish status
  Future<News> togglePublish(String id, bool isPublished) async {
    final response = await _dio.patch(
      '${SupabaseConfig.adminApiBaseUrl}/api/news/$id',
      data: {
        'is_published': isPublished,
        'published_at': isPublished ? DateTime.now().toIso8601String() : null,
      },
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to toggle publish status: ${response.data}');
    }

    final jsonMap = response.data as Map<String, dynamic>;
    return News.fromJson(jsonMap['data'] as Map<String, dynamic>);
  }

  // Toggle pin status
  Future<News> togglePin(String id, bool isPinned) async {
    final response = await _dio.patch(
      '${SupabaseConfig.adminApiBaseUrl}/api/news/$id',
      data: {
        'is_pinned': isPinned,
      },
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to toggle pin status: ${response.data}');
    }

    final jsonMap = response.data as Map<String, dynamic>;
    return News.fromJson(jsonMap['data'] as Map<String, dynamic>);
  }

  // Upload image to Cloudflare R2 via upload API route
  Future<String?> uploadNewsImage(File file, String fileName) async {
    try {
      final formData = FormData.fromMap({
        'folder': 'news',
        'file': await MultipartFile.fromFile(
          file.path,
          filename: file.path.split(RegExp(r'[/\\]')).last,
        ),
      });

      final response = await _dio.post(
        '${SupabaseConfig.adminApiBaseUrl}/api/upload',
        data: formData,
      );
      
      if (response.statusCode != 200) {
        return null;
      }
      
      final jsonMap = response.data as Map<String, dynamic>;
      return jsonMap['data'] as String?;
    } catch (_) {
      return null;
    }
  }

  // Delete image via delete-image API route
  Future<void> deleteNewsImage(String imageUrl) async {
    try {
      await _dio.post(
        '${SupabaseConfig.adminApiBaseUrl}/api/delete-image',
        data: {'url': imageUrl},
      );
    } catch (_) {}
  }
}

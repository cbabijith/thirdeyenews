import 'dart:io';
import 'package:dio/dio.dart';
import '../config/supabase_config.dart';
import '../models/ad.dart';

class AdRepository {
  final _dio = Dio(BaseOptions(
    connectTimeout: const Duration(seconds: 15),
    receiveTimeout: const Duration(seconds: 15),
  ));

  AdRepository(dynamic _);

  // Fetch all ads
  Future<List<Ad>> getAds() async {
    final response = await _dio.get('${SupabaseConfig.adminApiBaseUrl}/api/ads');
    if (response.statusCode != 200) {
      throw Exception('Failed to load ads: ${response.data}');
    }
    final jsonMap = response.data as Map<String, dynamic>;
    final data = jsonMap['data'] as List<dynamic>? ?? [];
    return data.map((json) => Ad.fromJson(json as Map<String, dynamic>)).toList();
  }

  // Create advertisement
  Future<Ad> createAd(Ad adItem) async {
    final response = await _dio.post(
      '${SupabaseConfig.adminApiBaseUrl}/api/ads',
      data: {
        'title': adItem.title,
        'image_url': adItem.imageUrl,
        'link_url': adItem.linkUrl,
        'position': adItem.position,
        'display_order': adItem.displayOrder,
        'is_active': adItem.isActive,
      },
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to create ad: ${response.data}');
    }
    final jsonMap = response.data as Map<String, dynamic>;
    return Ad.fromJson(jsonMap['data'] as Map<String, dynamic>);
  }

  // Update advertisement
  Future<Ad> updateAd(String id, Ad adItem) async {
    final response = await _dio.patch(
      '${SupabaseConfig.adminApiBaseUrl}/api/ads/$id',
      data: {
        'title': adItem.title,
        'image_url': adItem.imageUrl,
        'link_url': adItem.linkUrl,
        'position': adItem.position,
        'display_order': adItem.displayOrder,
        'is_active': adItem.isActive,
      },
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to update ad: ${response.data}');
    }
    final jsonMap = response.data as Map<String, dynamic>;
    return Ad.fromJson(jsonMap['data'] as Map<String, dynamic>);
  }

  // Delete advertisement
  Future<void> deleteAd(String id) async {
    final response = await _dio.delete('${SupabaseConfig.adminApiBaseUrl}/api/ads/$id');
    if (response.statusCode != 200) {
      throw Exception('Failed to delete ad: ${response.data}');
    }
  }

  // Toggle active status
  Future<Ad> toggleActive(String id, bool isActive) async {
    final response = await _dio.patch(
      '${SupabaseConfig.adminApiBaseUrl}/api/ads/$id',
      data: {'is_active': isActive},
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to toggle ad status: ${response.data}');
    }
    final jsonMap = response.data as Map<String, dynamic>;
    return Ad.fromJson(jsonMap['data'] as Map<String, dynamic>);
  }

  // Upload ad image to Cloudflare R2 via upload API route
  Future<String?> uploadAdImage(File file, String fileName) async {
    try {
      final formData = FormData.fromMap({
        'folder': 'ads',
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
  Future<void> deleteAdImage(String imageUrl) async {
    try {
      await _dio.post(
        '${SupabaseConfig.adminApiBaseUrl}/api/delete-image',
        data: {'url': imageUrl},
      );
    } catch (_) {}
  }
}

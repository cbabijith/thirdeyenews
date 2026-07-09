import 'package:dio/dio.dart';
import '../config/supabase_config.dart';
import '../models/category.dart';
import '../models/subcategory.dart';

class CategoryRepository {
  final _dio = Dio(BaseOptions(
    connectTimeout: const Duration(seconds: 15),
    receiveTimeout: const Duration(seconds: 15),
  ));

  CategoryRepository(dynamic _);

  // Fetch all categories
  Future<List<Category>> getCategories() async {
    final response = await _dio.get('${SupabaseConfig.adminApiBaseUrl}/api/categories');
    if (response.statusCode != 200) {
      throw Exception('Failed to load categories: ${response.data}');
    }
    final jsonMap = response.data as Map<String, dynamic>;
    final data = jsonMap['data'] as List<dynamic>? ?? [];
    return data.map((json) => Category.fromJson(json as Map<String, dynamic>)).toList();
  }

  // Fetch all subcategories
  Future<List<Subcategory>> getSubcategories() async {
    final response = await _dio.get('${SupabaseConfig.adminApiBaseUrl}/api/subcategories');
    if (response.statusCode != 200) {
      throw Exception('Failed to load subcategories: ${response.data}');
    }
    final jsonMap = response.data as Map<String, dynamic>;
    final data = jsonMap['data'] as List<dynamic>? ?? [];
    return data.map((json) => Subcategory.fromJson(json as Map<String, dynamic>)).toList();
  }

  // Create category
  Future<Category> createCategory(String name, String slug) async {
    final response = await _dio.post(
      '${SupabaseConfig.adminApiBaseUrl}/api/categories',
      data: {
        'name': name,
        'slug': slug,
        'description': null,
      },
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to create category: ${response.data}');
    }
    final jsonMap = response.data as Map<String, dynamic>;
    return Category.fromJson(jsonMap['data'] as Map<String, dynamic>);
  }

  // Update category
  Future<Category> updateCategory(String id, String name, String slug) async {
    final response = await _dio.patch(
      '${SupabaseConfig.adminApiBaseUrl}/api/categories/$id',
      data: {
        'name': name,
        'slug': slug,
        'description': null,
      },
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to update category: ${response.data}');
    }
    final jsonMap = response.data as Map<String, dynamic>;
    return Category.fromJson(jsonMap['data'] as Map<String, dynamic>);
  }

  // Delete category
  Future<void> deleteCategory(String id) async {
    final response = await _dio.delete('${SupabaseConfig.adminApiBaseUrl}/api/categories/$id');
    if (response.statusCode != 200) {
      throw Exception('Failed to delete category: ${response.data}');
    }
  }

  // Create subcategory
  Future<Subcategory> createSubcategory(
    String categoryId,
    String name,
    String slug,
    String? description,
  ) async {
    final response = await _dio.post(
      '${SupabaseConfig.adminApiBaseUrl}/api/subcategories',
      data: {
        'category_id': categoryId,
        'name': name,
        'slug': slug,
        'description': description,
      },
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to create subcategory: ${response.data}');
    }
    final jsonMap = response.data as Map<String, dynamic>;
    return Subcategory.fromJson(jsonMap['data'] as Map<String, dynamic>);
  }

  // Update subcategory
  Future<Subcategory> updateSubcategory(
    String id,
    String name,
    String slug,
    String? description,
  ) async {
    final response = await _dio.patch(
      '${SupabaseConfig.adminApiBaseUrl}/api/subcategories/$id',
      data: {
        'name': name,
        'slug': slug,
        'description': description,
      },
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to update subcategory: ${response.data}');
    }
    final jsonMap = response.data as Map<String, dynamic>;
    return Subcategory.fromJson(jsonMap['data'] as Map<String, dynamic>);
  }

  // Delete subcategory
  Future<void> deleteSubcategory(String id) async {
    final response = await _dio.delete('${SupabaseConfig.adminApiBaseUrl}/api/subcategories/$id');
    if (response.statusCode != 200) {
      throw Exception('Failed to delete subcategory: ${response.data}');
    }
  }

  // Update category priorities
  Future<void> updateCategoryPriorities(List<Map<String, dynamic>> updates) async {
    final response = await _dio.post(
      '${SupabaseConfig.adminApiBaseUrl}/api/categories/priorities',
      data: {'updates': updates},
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to update category order: ${response.data}');
    }
  }
}

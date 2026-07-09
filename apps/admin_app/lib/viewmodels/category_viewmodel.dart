import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/category.dart';
import '../models/subcategory.dart';
import '../providers.dart';
import '../repositories/category_repository.dart';

// State definition for Categories
class CategoryState {
  final bool isLoading;
  final List<Category> categories;
  final List<Subcategory> subcategories;
  final String? errorMessage;

  CategoryState({
    this.isLoading = false,
    this.categories = const [],
    this.subcategories = const [],
    this.errorMessage,
  });

  CategoryState copyWith({
    bool? isLoading,
    List<Category>? categories,
    List<Subcategory>? subcategories,
    String? errorMessage,
  }) {
    return CategoryState(
      isLoading: isLoading ?? this.isLoading,
      categories: categories ?? this.categories,
      subcategories: subcategories ?? this.subcategories,
      errorMessage: errorMessage,
    );
  }
}

class CategoryViewModel extends StateNotifier<CategoryState> {
  final CategoryRepository _categoryRepository;

  CategoryViewModel(this._categoryRepository) : super(CategoryState()) {
    fetchCategoriesAndSubcategories();
  }

  String _generateSlug(String name) {
    return name
        .toLowerCase()
        .replaceAll(RegExp(r'[^a-z0-9]+'), '-')
        .replaceAll(RegExp(r'(^-|-$)'), '');
  }

  // Load all categories and subcategories
  Future<void> fetchCategoriesAndSubcategories() async {
    state = state.copyWith(isLoading: true);
    try {
      final categories = await _categoryRepository.getCategories();
      final subcategories = await _categoryRepository.getSubcategories();
      state = CategoryState(
        categories: categories,
        subcategories: subcategories,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load categories',
      );
    }
  }

  // Add Category
  Future<bool> addCategory(String name) async {
    try {
      final slug = _generateSlug(name);
      final newCategory = await _categoryRepository.createCategory(name, slug);
      state = state.copyWith(
        categories: [...state.categories, newCategory]..sort((a, b) => a.name.compareTo(b.name)),
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  // Update Category
  Future<bool> updateCategory(String id, String name) async {
    try {
      final slug = _generateSlug(name);
      final updated = await _categoryRepository.updateCategory(id, name, slug);
      state = state.copyWith(
        categories: state.categories.map((c) => c.id == id ? updated : c).toList(),
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  // Delete Category
  Future<bool> deleteCategory(String id) async {
    try {
      await _categoryRepository.deleteCategory(id);
      state = state.copyWith(
        categories: state.categories.where((c) => c.id != id).toList(),
        subcategories: state.subcategories.where((s) => s.categoryId != id).toList(),
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  // Add Subcategory
  Future<bool> addSubcategory(String categoryId, String name, String? description) async {
    try {
      final slug = _generateSlug(name);
      final newSub = await _categoryRepository.createSubcategory(categoryId, name, slug, description);
      state = state.copyWith(
        subcategories: [...state.subcategories, newSub]..sort((a, b) => a.name.compareTo(b.name)),
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  // Update Subcategory
  Future<bool> updateSubcategory(String id, String name, String? description) async {
    try {
      final slug = _generateSlug(name);
      final updated = await _categoryRepository.updateSubcategory(id, name, slug, description);
      state = state.copyWith(
        subcategories: state.subcategories.map((s) => s.id == id ? updated : s).toList(),
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  // Delete Subcategory
  Future<bool> deleteSubcategory(String id) async {
    try {
      await _categoryRepository.deleteSubcategory(id);
      state = state.copyWith(
        subcategories: state.subcategories.where((s) => s.id != id).toList(),
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  // Reorder Categories
  Future<void> reorderCategories(int oldIndex, int newIndex) async {
    var index = newIndex;
    if (oldIndex < index) {
      index -= 1;
    }
    
    final updatedList = List<Category>.from(state.categories);
    final moved = updatedList.removeAt(oldIndex);
    updatedList.insert(index, moved);

    // Optimistically update state
    state = state.copyWith(categories: updatedList);

    try {
      final List<Map<String, dynamic>> updates = [];
      for (int i = 0; i < updatedList.length; i++) {
        updates.add({
          'id': updatedList[i].id,
          'priority': i,
        });
      }
      await _categoryRepository.updateCategoryPriorities(updates);
    } catch (_) {
      // Revert if error
      await fetchCategoriesAndSubcategories();
    }
  }
}

final categoryViewModelProvider = StateNotifierProvider<CategoryViewModel, CategoryState>((ref) {
  return CategoryViewModel(ref.watch(categoryRepositoryProvider));
});

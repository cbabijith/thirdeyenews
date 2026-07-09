import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../viewmodels/category_viewmodel.dart';
import '../../models/category.dart';
import '../../config/theme.dart';
import '../components/shimmer_container.dart';

class CategoryView extends ConsumerWidget {
  const CategoryView({super.key});

  void _showCategoryDialog(BuildContext context, WidgetRef ref, [Category? category]) {
    final nameController = TextEditingController(text: category?.name);
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        title: Text(category == null ? 'New Category' : 'Edit Category'),
        content: TextField(
          controller: nameController,
          autofocus: true,
          decoration: const InputDecoration(
            labelText: 'Category Name',
            hintText: 'e.g. Entertainment',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              final name = nameController.text.trim();
              if (name.isEmpty) return;

              final notifier = ref.read(categoryViewModelProvider.notifier);
              final success = category == null
                  ? await notifier.addCategory(name)
                  : await notifier.updateCategory(category.id, name);

              if (context.mounted) {
                Navigator.pop(dialogContext);
                if (success) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(category == null
                          ? 'Category created successfully!'
                          : 'Category updated successfully!'),
                    ),
                  );
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Failed to save category')),
                  );
                }
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  void _confirmDelete(BuildContext context, String title, String content, Future<bool> Function() onDelete) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        title: Text(title),
        content: Text(content),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext), child: const Text('Cancel')),
          TextButton(
            onPressed: () async {
              Navigator.pop(dialogContext);
              final success = await onDelete();
              if (context.mounted) {
                if (success) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Category deleted successfully!')),
                  );
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Failed to delete category')),
                  );
                }
              }
            },
            child: const Text('Delete', style: TextStyle(color: AppTheme.dangerColor)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categoryState = ref.watch(categoryViewModelProvider);
    final notifier = ref.read(categoryViewModelProvider.notifier);

    if (categoryState.isLoading) {
      return _buildCategoryShimmer(context);
    }

    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppTheme.secondaryColor,
        foregroundColor: Colors.white,
        elevation: 4,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        onPressed: () => _showCategoryDialog(context, ref),
        icon: const Icon(Icons.create_new_folder_outlined, size: 20),
        label: const Text(
          'Create Category',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 0.3),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Title (Web aligned)
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Categories',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.lightTextPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '${categoryState.categories.length} categories',
                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // List of Categories
            Expanded(
              child: categoryState.categories.isEmpty
                  ? const Center(child: Text('No categories found. Click + to add.'))
                  : ReorderableListView.builder(
                      padding: EdgeInsets.zero,
                      itemCount: categoryState.categories.length,
                      onReorder: notifier.reorderCategories,
                      itemBuilder: (context, index) {
                        final category = categoryState.categories[index];

                        return Card(
                          key: ValueKey(category.id),
                          margin: const EdgeInsets.only(bottom: 12),
                          elevation: 0.5,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                            side: const BorderSide(color: Color(0xFFE2E8F0)),
                          ),
                          child: ListTile(
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 8,
                            ),
                            leading: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                // Drag indicator
                                const Icon(Icons.drag_handle, color: Colors.grey, size: 20),
                                const SizedBox(width: 8),
                                // Icon Folder
                                Container(
                                  width: 40,
                                  height: 40,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF1F5F9), // Slate 100
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Icon(
                                    Icons.folder_open_outlined,
                                    color: Color(0xFF64748B), // Slate 500
                                  ),
                                ),
                              ],
                            ),
                            title: Text(
                              category.name,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                                color: AppTheme.lightTextPrimary,
                              ),
                            ),
                            subtitle: Text(
                              '/${category.slug}',
                              style: const TextStyle(
                                fontSize: 12,
                                color: Colors.grey,
                              ),
                            ),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.edit_outlined, size: 20),
                                  onPressed: () =>
                                      _showCategoryDialog(context, ref, category),
                                  tooltip: 'Edit',
                                ),
                                IconButton(
                                  icon: const Icon(
                                    Icons.delete_outline_rounded,
                                    color: AppTheme.dangerColor,
                                    size: 20,
                                  ),
                                  onPressed: () => _confirmDelete(
                                    context,
                                    'Delete Category',
                                    'Are you sure you want to delete "${category.name}"?',
                                    () => notifier.deleteCategory(category.id),
                                  ),
                                  tooltip: 'Delete',
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryShimmer(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Title
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ShimmerContainer(width: 120, height: 24, borderRadius: 6),
                SizedBox(height: 8),
                ShimmerContainer(width: 85, height: 13, borderRadius: 3),
              ],
            ),
            const SizedBox(height: 16),

            // List of Category Cards Shimmer
            Expanded(
              child: ListView.separated(
                padding: EdgeInsets.zero,
                itemCount: 5,
                separatorBuilder: (context, index) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  return Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFFE2E8F0), width: 1),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    child: const Row(
                      children: [
                        // Drag handle + folder container
                        ShimmerContainer(width: 16, height: 20, borderRadius: 3),
                        SizedBox(width: 8),
                        ShimmerContainer(width: 40, height: 40, borderRadius: 8),
                        SizedBox(width: 12),

                        // Title & Subtitle slug
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              ShimmerContainer(width: 110, height: 14, borderRadius: 3),
                              SizedBox(height: 6),
                              ShimmerContainer(width: 70, height: 11, borderRadius: 2),
                            ],
                          ),
                        ),

                        // Edit / Delete icons
                        ShimmerContainer(width: 28, height: 28, borderRadius: 14),
                        SizedBox(width: 8),
                        ShimmerContainer(width: 28, height: 28, borderRadius: 14),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

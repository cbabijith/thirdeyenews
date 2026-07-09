import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../viewmodels/category_viewmodel.dart';
import '../../models/category.dart';
import '../../models/subcategory.dart';
import '../../config/theme.dart';

class CategoryView extends ConsumerWidget {
  const CategoryView({super.key});

  void _showCategoryDialog(BuildContext context, WidgetRef ref, [Category? category]) {
    final nameController = TextEditingController(text: category?.name);
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
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
            onPressed: () => Navigator.pop(context),
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
                Navigator.pop(context);
                if (!success) {
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

  void _showSubcategoryDialog(BuildContext context, WidgetRef ref, String categoryId, [Subcategory? subcategory]) {
    final nameController = TextEditingController(text: subcategory?.name);
    final descController = TextEditingController(text: subcategory?.description);
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(subcategory == null ? 'New Subcategory' : 'Edit Subcategory'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              autofocus: true,
              decoration: const InputDecoration(labelText: 'Subcategory Name'),
            ),
            TextField(
              controller: descController,
              decoration: const InputDecoration(labelText: 'Description (Optional)'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              final name = nameController.text.trim();
              final desc = descController.text.trim();
              if (name.isEmpty) return;

              final notifier = ref.read(categoryViewModelProvider.notifier);
              final success = subcategory == null
                  ? await notifier.addSubcategory(categoryId, name, desc.isEmpty ? null : desc)
                  : await notifier.updateSubcategory(subcategory.id, name, desc.isEmpty ? null : desc);

              if (context.mounted) {
                Navigator.pop(context);
                if (!success) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Failed to save subcategory')),
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

  void _confirmDelete(BuildContext context, String title, String content, VoidCallback onDelete) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(content),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          TextButton(
            onPressed: () {
              onDelete();
              Navigator.pop(context);
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
      return const Center(child: CircularProgressIndicator());
    }

    return Scaffold(
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showCategoryDialog(context, ref),
        child: const Icon(Icons.add),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: categoryState.categories.isEmpty
            ? const Center(child: Text('No categories found. Click + to add.'))
            : ReorderableListView.builder(
                itemCount: categoryState.categories.length,
                onReorder: notifier.reorderCategories,
                itemBuilder: (context, index) {
                  final category = categoryState.categories[index];
                  final categorySubs = categoryState.subcategories
                      .where((s) => s.categoryId == category.id)
                      .toList();

                  return Card(
                    key: ValueKey(category.id),
                    margin: const EdgeInsets.only(bottom: 12),
                    child: ExpansionTile(
                      leading: const Icon(Icons.folder_open_outlined, color: AppTheme.primaryColor),
                      title: Text(category.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text('/${category.slug}', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            icon: const Icon(Icons.edit_outlined),
                            onPressed: () => _showCategoryDialog(context, ref, category),
                          ),
                          IconButton(
                            icon: const Icon(Icons.delete_outline, color: AppTheme.dangerColor),
                            onPressed: () => _confirmDelete(
                              context,
                              'Delete Category',
                              'Are you sure you want to delete "${category.name}"? This will also delete all subcategories.',
                              () => notifier.deleteCategory(category.id),
                            ),
                          ),
                          const Icon(Icons.drag_handle, color: Colors.grey),
                        ],
                      ),
                      children: [
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text('SUBCATEGORIES', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
                                  TextButton.icon(
                                    onPressed: () => _showSubcategoryDialog(context, ref, category.id),
                                    icon: const Icon(Icons.add, size: 16),
                                    label: const Text('Add Subcategory', style: TextStyle(fontSize: 12)),
                                  ),
                                ],
                              ),
                              if (categorySubs.isEmpty)
                                const Padding(
                                  padding: EdgeInsets.symmetric(vertical: 8.0),
                                  child: Text('No subcategories yet.', style: TextStyle(fontSize: 12, color: Colors.grey)),
                                )
                              else
                                ListView.builder(
                                  shrinkWrap: true,
                                  physics: const NeverScrollableScrollPhysics(),
                                  itemCount: categorySubs.length,
                                  itemBuilder: (context, subIndex) {
                                    final sub = categorySubs[subIndex];
                                    return ListTile(
                                      contentPadding: EdgeInsets.zero,
                                      title: Text(sub.name, style: const TextStyle(fontSize: 14)),
                                      subtitle: Text('/${sub.slug}', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                                      trailing: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          IconButton(
                                            icon: const Icon(Icons.edit_outlined, size: 18),
                                            onPressed: () => _showSubcategoryDialog(context, ref, category.id, sub),
                                          ),
                                          IconButton(
                                            icon: const Icon(Icons.delete_outline, size: 18, color: AppTheme.dangerColor),
                                            onPressed: () => _confirmDelete(
                                              context,
                                              'Delete Subcategory',
                                              'Are you sure you want to delete subcategory "${sub.name}"?',
                                              () => notifier.deleteSubcategory(sub.id),
                                            ),
                                          ),
                                        ],
                                      ),
                                    );
                                  },
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
      ),
    );
  }
}

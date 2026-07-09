import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../viewmodels/news_viewmodel.dart';
import '../../viewmodels/category_viewmodel.dart';
import 'components/news_card.dart';
import 'news_form_view.dart';
import '../../config/theme.dart';

class NewsListView extends ConsumerStatefulWidget {
  const NewsListView({super.key});

  @override
  ConsumerState<NewsListView> createState() => _NewsListViewState();
}

class _NewsListViewState extends ConsumerState<NewsListView> {
  final _scrollController = ScrollController();
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 200) {
      ref.read(newsViewModelProvider.notifier).fetchNews();
    }
  }

  void _confirmDelete(BuildContext context, String title, VoidCallback onDelete) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Article?'),
        content: Text('Are you sure you want to delete "$title"? This cannot be undone.'),
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

  Widget _buildDropdownContainer({required Widget child}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: const Color(0xFFE2E8F0)),
        borderRadius: BorderRadius.circular(8),
      ),
      height: 48,
      alignment: Alignment.center,
      child: DropdownButtonHideUnderline(child: child),
    );
  }

  @override
  Widget build(BuildContext context) {
    final newsState = ref.watch(newsViewModelProvider);
    final categoryState = ref.watch(categoryViewModelProvider);
    final newsNotifier = ref.read(newsViewModelProvider.notifier);
    final width = MediaQuery.of(context).size.width;
    final isMobile = width < 600;

    final searchField = TextField(
      controller: _searchController,
      decoration: InputDecoration(
        hintText: 'Search articles...',
        prefixIcon: const Icon(Icons.search, size: 20),
        suffixIcon: _searchController.text.isNotEmpty
            ? IconButton(
                icon: const Icon(Icons.clear, size: 18),
                onPressed: () {
                  _searchController.clear();
                  newsNotifier.setSearchQuery('');
                  setState(() {});
                },
              )
            : null,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppTheme.primaryColor),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12),
        fillColor: Colors.white,
        filled: true,
      ),
      onChanged: (val) {
        newsNotifier.setSearchQuery(val);
        setState(() {});
      },
    );

    final categoryDropdown = _buildDropdownContainer(
      child: DropdownButton<String>(
        value: newsState.filterCategoryId.isEmpty ? null : newsState.filterCategoryId,
        hint: const Text('All Categories', style: TextStyle(fontSize: 13, color: Colors.grey)),
        icon: const Icon(Icons.filter_list, size: 18),
        isExpanded: true,
        style: const TextStyle(fontSize: 13, color: AppTheme.lightTextPrimary),
        onChanged: (val) => newsNotifier.setFilterCategory(val ?? ''),
        items: [
          const DropdownMenuItem<String>(
            value: null,
            child: Text('All Categories'),
          ),
          ...categoryState.categories.map((cat) {
            return DropdownMenuItem<String>(
              value: cat.id,
              child: Text(cat.name),
            );
          }),
        ],
      ),
    );

    final sortDropdown = _buildDropdownContainer(
      child: DropdownButton<String>(
        value: newsState.sortBy,
        icon: const Icon(Icons.sort, size: 18),
        isExpanded: true,
        style: const TextStyle(fontSize: 13, color: AppTheme.lightTextPrimary),
        onChanged: (val) => newsNotifier.setSortBy(val ?? 'date-desc'),
        items: const [
          DropdownMenuItem(value: 'date-desc', child: Text('Newest')),
          DropdownMenuItem(value: 'date-asc', child: Text('Oldest')),
          DropdownMenuItem(value: 'views-desc', child: Text('Most Viewed')),
          DropdownMenuItem(value: 'title-asc', child: Text('Title A-Z')),
          DropdownMenuItem(value: 'title-desc', child: Text('Title Z-A')),
        ],
      ),
    );

    return Scaffold(
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const NewsFormView()),
          );
        },
        child: const Icon(Icons.add),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Responsive Toolbar (Search, Filter, Sort)
            isMobile
                ? Column(
                    children: [
                      SizedBox(height: 48, child: searchField),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(child: categoryDropdown),
                          const SizedBox(width: 12),
                          Expanded(child: sortDropdown),
                        ],
                      ),
                    ],
                  )
                : Row(
                    children: [
                      Expanded(flex: 3, child: SizedBox(height: 48, child: searchField)),
                      const SizedBox(width: 12),
                      Expanded(flex: 2, child: categoryDropdown),
                      const SizedBox(width: 12),
                      Expanded(flex: 2, child: sortDropdown),
                    ],
                  ),
            const SizedBox(height: 12),

            // Articles List
            Expanded(
              child: newsState.isLoading && newsState.newsItems.isEmpty
                  ? const Center(child: CircularProgressIndicator())
                  : newsState.newsItems.isEmpty
                      ? const Center(child: Text('No articles found.'))
                      : RefreshIndicator(
                          onRefresh: () => newsNotifier.fetchNews(refresh: true),
                          child: ListView.builder(
                            padding: EdgeInsets.zero,
                            controller: _scrollController,
                            itemCount: newsState.newsItems.length + (newsState.isLoadingMore ? 1 : 0),
                            itemBuilder: (context, index) {
                              if (index == newsState.newsItems.length) {
                                return const Center(
                                  child: Padding(
                                    padding: EdgeInsets.all(16.0),
                                    child: CircularProgressIndicator(),
                                  ),
                                );
                              }
                              final item = newsState.newsItems[index];
                              return NewsCard(
                                item: item,
                                onTogglePublish: () => newsNotifier.togglePublish(item),
                                onTogglePin: () => newsNotifier.togglePin(item),
                                onEdit: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) => NewsFormView(initialArticle: item),
                                    ),
                                  );
                                },
                                onDelete: () => _confirmDelete(
                                  context,
                                  item.title,
                                  () => newsNotifier.deleteArticle(item.id),
                                ),
                              );
                            },
                          ),
                        ),
            ),
          ],
        ),
      ),
    );
  }
}

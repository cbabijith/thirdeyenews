import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/news.dart';
import '../providers.dart';
import '../repositories/news_repository.dart';

// State definition for News list
class NewsState {
  final bool isLoading;
  final bool isLoadingMore;
  final List<News> newsItems;
  final int count;
  final String searchQuery;
  final String filterCategoryId;
  final String sortBy;
  final bool hasMore;
  final String? errorMessage;

  NewsState({
    this.isLoading = false,
    this.isLoadingMore = false,
    this.newsItems = const [],
    this.count = 0,
    this.searchQuery = '',
    this.filterCategoryId = '',
    this.sortBy = 'date-desc',
    this.hasMore = true,
    this.errorMessage,
  });

  NewsState copyWith({
    bool? isLoading,
    bool? isLoadingMore,
    List<News>? newsItems,
    int? count,
    String? searchQuery,
    String? filterCategoryId,
    String? sortBy,
    bool? hasMore,
    String? errorMessage,
  }) {
    return NewsState(
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      newsItems: newsItems ?? this.newsItems,
      count: count ?? this.count,
      searchQuery: searchQuery ?? this.searchQuery,
      filterCategoryId: filterCategoryId ?? this.filterCategoryId,
      sortBy: sortBy ?? this.sortBy,
      hasMore: hasMore ?? this.hasMore,
      errorMessage: errorMessage,
    );
  }
}

class NewsViewModel extends StateNotifier<NewsState> {
  final NewsRepository _newsRepository;
  static const int _limit = 10;

  NewsViewModel(this._newsRepository) : super(NewsState()) {
    fetchNews(refresh: true);
  }

  // Fetch news
  Future<void> fetchNews({bool refresh = false}) async {
    if (refresh) {
      state = state.copyWith(isLoading: true, newsItems: [], hasMore: true);
    } else if (!state.hasMore || state.isLoadingMore) {
      return;
    } else {
      state = state.copyWith(isLoadingMore: true);
    }

    try {
      final offset = refresh ? 0 : state.newsItems.length;
      final result = await _newsRepository.searchNews(
        searchQuery: state.searchQuery,
        categoryId: state.filterCategoryId,
        sortBy: state.sortBy,
        limit: _limit,
        offset: offset,
      );

      final List<News> newItems = result['data'] as List<News>;
      final int totalCount = result['count'] as int;

      state = state.copyWith(
        isLoading: false,
        isLoadingMore: false,
        newsItems: refresh ? newItems : [...state.newsItems, ...newItems],
        count: totalCount,
        hasMore: newItems.length >= _limit,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        isLoadingMore: false,
        errorMessage: 'Failed to load news articles',
      );
    }
  }

  void setSearchQuery(String query) {
    if (state.searchQuery != query) {
      state = state.copyWith(searchQuery: query);
      fetchNews(refresh: true);
    }
  }

  void setFilterCategory(String categoryId) {
    if (state.filterCategoryId != categoryId) {
      state = state.copyWith(filterCategoryId: categoryId);
      fetchNews(refresh: true);
    }
  }

  void setSortBy(String sortBy) {
    if (state.sortBy != sortBy) {
      state = state.copyWith(sortBy: sortBy);
      fetchNews(refresh: true);
    }
  }

  // Create article
  Future<bool> createArticle(News article, File? localImage, File? localAdImage) async {
    try {
      String? imageUrl = article.imageUrl;
      if (localImage != null) {
        final fileName = '${DateTime.now().millisecondsSinceEpoch}.jpg';
        imageUrl = await _newsRepository.uploadNewsImage(localImage, fileName);
      }

      String? adImageUrl = article.adImageUrl;
      if (localAdImage != null) {
        final fileName = 'ad_${DateTime.now().millisecondsSinceEpoch}.jpg';
        adImageUrl = await _newsRepository.uploadNewsImage(localAdImage, fileName);
      }

      final created = await _newsRepository.createNews(article.copyWith(
        imageUrl: imageUrl,
        adImageUrl: adImageUrl,
      ));
      state = state.copyWith(
        newsItems: [created, ...state.newsItems],
        count: state.count + 1,
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  // Update article
  Future<bool> updateArticle(String id, News article, File? localImage, File? localAdImage) async {
    try {
      String? imageUrl = article.imageUrl;
      if (localImage != null) {
        final fileName = '${DateTime.now().millisecondsSinceEpoch}.jpg';
        imageUrl = await _newsRepository.uploadNewsImage(localImage, fileName);
      }

      String? adImageUrl = article.adImageUrl;
      if (localAdImage != null) {
        final fileName = 'ad_${DateTime.now().millisecondsSinceEpoch}.jpg';
        adImageUrl = await _newsRepository.uploadNewsImage(localAdImage, fileName);
      }

      final updated = await _newsRepository.updateNews(id, article.copyWith(
        imageUrl: imageUrl,
        adImageUrl: adImageUrl,
      ));
      state = state.copyWith(
        newsItems: state.newsItems.map((n) => n.id == id ? updated : n).toList(),
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  // Delete article
  Future<bool> deleteArticle(String id) async {
    try {
      await _newsRepository.deleteNews(id);
      state = state.copyWith(
        newsItems: state.newsItems.where((n) => n.id != id).toList(),
        count: state.count - 1,
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  // Toggle publish
  Future<void> togglePublish(News article) async {
    final newStatus = !article.isPublished;
    try {
      final updated = await _newsRepository.togglePublish(article.id, newStatus);
      state = state.copyWith(
        newsItems: state.newsItems.map((n) => n.id == article.id ? updated : n).toList(),
      );
    } catch (_) {}
  }

  // Toggle pin
  Future<void> togglePin(News article) async {
    final newStatus = !article.isPinned;
    try {
      final updated = await _newsRepository.togglePin(article.id, newStatus);
      state = state.copyWith(
        newsItems: state.newsItems.map((n) => n.id == article.id ? updated : n).toList(),
      );
    } catch (_) {}
  }
}

final newsViewModelProvider = StateNotifierProvider<NewsViewModel, NewsState>((ref) {
  return NewsViewModel(ref.watch(newsRepositoryProvider));
});

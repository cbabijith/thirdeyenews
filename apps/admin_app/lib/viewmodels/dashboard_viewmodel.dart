import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../config/supabase_config.dart';
import '../models/news.dart';

class DashboardState {
  final bool isLoading;
  final int publishedCount;
  final int draftCount;
  final int totalViews;
  final int totalCategories;
  final List<News> topViewed;
  final String? errorMessage;

  DashboardState({
    this.isLoading = false,
    this.publishedCount = 0,
    this.draftCount = 0,
    this.totalViews = 0,
    this.totalCategories = 0,
    this.topViewed = const [],
    this.errorMessage,
  });

  DashboardState copyWith({
    bool? isLoading,
    int? publishedCount,
    int? draftCount,
    int? totalViews,
    int? totalCategories,
    List<News>? topViewed,
    String? errorMessage,
  }) {
    return DashboardState(
      isLoading: isLoading ?? this.isLoading,
      publishedCount: publishedCount ?? this.publishedCount,
      draftCount: draftCount ?? this.draftCount,
      totalViews: totalViews ?? this.totalViews,
      totalCategories: totalCategories ?? this.totalCategories,
      topViewed: topViewed ?? this.topViewed,
      errorMessage: errorMessage,
    );
  }
}

class DashboardViewModel extends StateNotifier<DashboardState> {
  final _dio = Dio(BaseOptions(
    connectTimeout: const Duration(seconds: 15),
    receiveTimeout: const Duration(seconds: 15),
  ));

  DashboardViewModel() : super(DashboardState()) {
    fetchStats();
  }

  Future<void> fetchStats() async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final response = await _dio.get('${SupabaseConfig.adminApiBaseUrl}/api/dashboard');
      
      if (response.statusCode != 200) {
        throw Exception('Failed to load stats (status: ${response.statusCode})');
      }

      final jsonMap = response.data as Map<String, dynamic>;
      final data = jsonMap['data'] as Map<String, dynamic>;

      final topViewedJson = data['topViewed'] as List<dynamic>? ?? [];
      final topViewedList = topViewedJson.map((json) => News.fromJson(json as Map<String, dynamic>)).toList();

      int parseInt(dynamic val) {
        if (val == null) return 0;
        if (val is num) return val.toInt();
        if (val is String) return int.tryParse(val) ?? 0;
        return 0;
      }

      state = DashboardState(
        isLoading: false,
        publishedCount: parseInt(data['publishedCount']),
        draftCount: parseInt(data['draftCount']),
        totalViews: parseInt(data['totalViews']),
        totalCategories: parseInt(data['totalCategories']),
        topViewed: topViewedList,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load dashboard metrics: $e',
      );
    }
  }
}

final dashboardViewModelProvider =
    StateNotifierProvider<DashboardViewModel, DashboardState>((ref) {
  return DashboardViewModel();
});

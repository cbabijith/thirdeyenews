import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/ad.dart';
import '../providers.dart';
import '../repositories/ad_repository.dart';

// State definition for Ads
class AdState {
  final bool isLoading;
  final List<Ad> ads;
  final String? errorMessage;

  AdState({
    this.isLoading = false,
    this.ads = const [],
    this.errorMessage,
  });

  AdState copyWith({
    bool? isLoading,
    List<Ad>? ads,
    String? errorMessage,
  }) {
    return AdState(
      isLoading: isLoading ?? this.isLoading,
      ads: ads ?? this.ads,
      errorMessage: errorMessage,
    );
  }
}

class AdViewModel extends StateNotifier<AdState> {
  final AdRepository _adRepository;

  AdViewModel(this._adRepository) : super(AdState()) {
    fetchAds();
  }

  // Fetch all ads
  Future<void> fetchAds() async {
    state = state.copyWith(isLoading: true);
    try {
      final adsList = await _adRepository.getAds();
      state = AdState(ads: adsList, isLoading: false);
    } catch (_) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load advertisements',
      );
    }
  }

  // Create advertisement
  Future<bool> createAd(Ad adItem, File? localImage) async {
    try {
      String imageUrl = adItem.imageUrl;
      if (localImage != null) {
        final fileName = '${DateTime.now().millisecondsSinceEpoch}.jpg';
        final uploadedUrl = await _adRepository.uploadAdImage(localImage, fileName);
        if (uploadedUrl == null) return false;
        imageUrl = uploadedUrl;
      }

      await _adRepository.createAd(adItem.copyWith(imageUrl: imageUrl));
      await fetchAds(); // Refetch to get correct single active state for bottom_nav
      return true;
    } catch (_) {
      return false;
    }
  }

  // Update advertisement
  Future<bool> updateAd(String id, Ad adItem, File? localImage) async {
    try {
      String imageUrl = adItem.imageUrl;
      if (localImage != null) {
        final fileName = '${DateTime.now().millisecondsSinceEpoch}.jpg';
        final uploadedUrl = await _adRepository.uploadAdImage(localImage, fileName);
        if (uploadedUrl == null) return false;
        imageUrl = uploadedUrl;
      }

      await _adRepository.updateAd(id, adItem.copyWith(imageUrl: imageUrl));
      await fetchAds(); // Refetch to align database single active constraints
      return true;
    } catch (_) {
      return false;
    }
  }

  // Delete advertisement
  Future<bool> deleteAd(String id) async {
    try {
      await _adRepository.deleteAd(id);
      state = state.copyWith(ads: state.ads.where((a) => a.id != id).toList());
      return true;
    } catch (_) {
      return false;
    }
  }

  // Toggle active status
  Future<void> toggleActive(Ad adItem) async {
    final newActiveStatus = !adItem.isActive;
    
    // Optimistic UI update
    state = state.copyWith(
      ads: state.ads.map((a) => a.id == adItem.id ? a.copyWith(isActive: newActiveStatus) : a).toList(),
    );

    try {
      await _adRepository.toggleActive(adItem.id, newActiveStatus);
      // If position is bottom_nav, the DB trigger updates other bottom_nav ads
      if (adItem.position == 'bottom_nav') {
        await fetchAds();
      }
    } catch (_) {
      // Revert if error
      await fetchAds();
    }
  }
}

final adViewModelProvider = StateNotifierProvider<AdViewModel, AdState>((ref) {
  return AdViewModel(ref.watch(adRepositoryProvider));
});

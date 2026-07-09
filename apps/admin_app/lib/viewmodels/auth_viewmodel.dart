import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart' as sb;
import '../models/profile.dart';
import '../providers.dart';
import '../repositories/auth_repository.dart';

// State definition for Auth
class AuthState {
  final bool isLoading;
  final sb.User? user;
  final Profile? profile;
  final String? errorMessage;

  AuthState({
    this.isLoading = false,
    this.user,
    this.profile,
    this.errorMessage,
  });

  AuthState copyWith({
    bool? isLoading,
    sb.User? user,
    Profile? profile,
    String? errorMessage,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      user: user ?? this.user,
      profile: profile ?? this.profile,
      errorMessage: errorMessage,
    );
  }

  bool get isAuthenticated => user != null && profile != null && profile!.isAuthorized;
}

// StateNotifier implementation
class AuthViewModel extends StateNotifier<AuthState> {
  final AuthRepository _authRepository;

  AuthViewModel(this._authRepository) : super(AuthState()) {
    _init();
  }

  void _init() {
    // Listen to changes in auth state from supabase, deferred to the next microtask
    // to prevent mutating provider state synchronously during the widget build phase.
    Future.microtask(() {
      _authRepository.authStateChanges.listen((data) async {
        final user = data.session?.user;
        if (user == null) {
          if (mounted) state = AuthState();
        } else {
          await _fetchProfileForUser(user);
        }
      });
    });
  }

  // Initial check on startup
  Future<void> checkCurrentUser() async {
    final user = _authRepository.currentUser;
    if (user != null) {
      await _fetchProfileForUser(user);
    }
  }

  Future<void> _fetchProfileForUser(sb.User user) async {
    await Future.microtask(() {});
    if (!mounted) return;
    state = state.copyWith(isLoading: true);
    try {
      final profile = await _authRepository.getCurrentUserProfile();
      
      if (profile == null) {
        await _authRepository.signOut();
        state = AuthState(errorMessage: 'Profile record not found in database.');
      } else if (!profile.isAuthorized) {
        await _authRepository.signOut();
        state = AuthState(errorMessage: 'Access denied: Requires administrator or staff privileges.');
      } else {
        state = AuthState(user: user, profile: profile);
      }
    } catch (e) {
      await _authRepository.signOut();
      state = AuthState(errorMessage: 'Unable to retrieve user profile: $e');
    }
  }

  // Sign in
  Future<bool> signIn(String email, String password) async {
    state = state.copyWith(isLoading: true);
    try {
      await _authRepository.signIn(email, password);
      // Success will trigger state change listener
      return true;
    } on sb.AuthException catch (e) {
      state = AuthState(errorMessage: e.message);
      return false;
    } catch (e) {
      state = AuthState(errorMessage: 'An unexpected error occurred during login.');
      return false;
    }
  }

  // Sign out
  Future<void> signOut() async {
    state = state.copyWith(isLoading: true);
    await _authRepository.signOut();
    state = AuthState();
  }
}

// StateNotifierProvider
final authViewModelProvider = StateNotifierProvider<AuthViewModel, AuthState>((ref) {
  return AuthViewModel(ref.watch(authRepositoryProvider));
});

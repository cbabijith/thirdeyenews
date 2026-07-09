import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/profile.dart';

class AuthRepository {
  final SupabaseClient _supabase;

  AuthRepository(this._supabase);

  // Sign in with email and password
  Future<AuthResponse> signIn(String email, String password) async {
    return await _supabase.auth.signInWithPassword(
      email: email,
      password: password,
    );
  }

  // Sign out from current session
  Future<void> signOut() async {
    await _supabase.auth.signOut();
  }

  // Get current session user details
  User? get currentUser => _supabase.auth.currentUser;

  Future<Profile?> getCurrentUserProfile() async {
    final user = currentUser;
    if (user == null) return null;

    final data = await _supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    
    return Profile.fromJson(data);
  }

  // Listen to Auth State Changes
  Stream<AuthState> get authStateChanges => _supabase.auth.onAuthStateChange;
}

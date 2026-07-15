class Profile {
  final String id;
  final String? fullName;
  final String? email;
  final String role; // 'superadmin' | 'admin' | 'staff' | 'user'

  Profile({
    required this.id,
    this.fullName,
    this.email,
    required this.role,
  });

  factory Profile.fromJson(Map<String, dynamic> json) {
    return Profile(
      id: json['id'] as String,
      fullName: json['full_name'] as String?,
      email: json['email'] as String?,
      role: json['role'] as String? ?? 'user',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'full_name': fullName,
      'email': email,
      'role': role,
    };
  }

  bool get isSuperAdmin => role == 'superadmin';
  bool get isAdmin => role == 'admin';
  bool get isStaff => role == 'staff';
  bool get isAuthorized => isSuperAdmin || isAdmin || isStaff;
}

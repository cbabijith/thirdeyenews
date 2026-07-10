import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../../config/theme.dart';
import '../../viewmodels/auth_viewmodel.dart';
import '../ads/ad_list_view.dart';
import '../categories/category_view.dart';
import '../news/news_list_view.dart';
import 'dashboard_overview_view.dart';

class DashboardView extends ConsumerStatefulWidget {
  const DashboardView({super.key});

  @override
  ConsumerState<DashboardView> createState() => _DashboardViewState();
}

class _DashboardViewState extends ConsumerState<DashboardView> {
  int _selectedIndex = 0;
  bool _sidebarOpen = true;

  final List<String> _titles = [
    'Dashboard',
    'News Management',
    'Categories & Subcategories',
    'Advertisements',
  ];

  void _changeTab(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  void _showLogoutDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.red[50],
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.logout,
                color: AppTheme.dangerColor,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            const Text(
              'Logout?',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ],
        ),
        content: const Text(
          'You\'ll need to sign in again to access the admin panel.',
          style: TextStyle(color: Colors.grey, fontSize: 14),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.dangerColor,
              foregroundColor: Colors.white,
              minimumSize: const Size(90, 36),
            ),
            onPressed: () {
              Navigator.pop(context);
              ref.read(authViewModelProvider.notifier).signOut();
            },
            child: const Text('Logout'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authViewModelProvider);
    final width = MediaQuery.of(context).size.width;
    final isWideScreen = width > 768;

    final views = [
      DashboardOverviewView(onTabSelect: _changeTab),
      const NewsListView(),
      const CategoryView(),
      const AdListView(),
    ];

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textPrimary = isDark ? AppTheme.darkTextPrimary : AppTheme.lightTextPrimary;
    final borderCol = isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0);

    return Scaffold(
      appBar: isWideScreen
          ? AppBar(
              title: Row(
                children: [
                  GestureDetector(
                    onTap: _showLogoutDialog,
                    child: MouseRegion(
                      cursor: SystemMouseCursors.click,
                      child: Container(
                        width: 32,
                        height: 32,
                        padding: const EdgeInsets.all(3),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryColor,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: SvgPicture.asset(
                          'assets/images/logo.svg',
                          fit: BoxFit.contain,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    'ThirdEye News',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: textPrimary,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Container(
                    width: 1,
                    height: 16,
                    color: borderCol,
                  ),
                  const SizedBox(width: 10),
                  Text(
                    _titles[_selectedIndex],
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: isDark ? AppTheme.darkTextSecondary : Colors.grey[600],
                    ),
                  ),
                ],
              ),
              actions: [
                if (authState.profile != null) ...[
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          authState.profile!.fullName ??
                              authState.profile!.email ??
                              '',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Text(
                          authState.profile!.role.toUpperCase(),
                          style: const TextStyle(
                            fontSize: 10,
                            color: AppTheme.primaryColor,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                ],
              ],
            )
          : null, // Custom sticky header on mobile
      body: Column(
        children: [
          if (!isWideScreen)
            SafeArea(bottom: false, child: _buildMobileHeader()),
          Expanded(
            child: Row(
              children: [
                if (isWideScreen) _buildWebSidebar(),
                Expanded(child: views[_selectedIndex]),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: isWideScreen ? null : _buildCustomBottomNavBar(),
    );
  }

  Widget _buildMobileHeader() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? AppTheme.darkSurface : Colors.white;
    final borderCol = isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0);
    final textPrimary = isDark ? AppTheme.darkTextPrimary : AppTheme.lightTextPrimary;

    return Container(
      height: 70,
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      decoration: BoxDecoration(
        color: cardBg,
        border: Border(bottom: BorderSide(color: borderCol)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              GestureDetector(
                onTap: _showLogoutDialog,
                child: MouseRegion(
                  cursor: SystemMouseCursors.click,
                  child: Container(
                    width: 90,
                    height: 90,
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      // color: AppTheme.primaryColor,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: SvgPicture.asset(
                      'assets/images/logo.svg',
                      fit: BoxFit.contain,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'ThirdEye News',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: textPrimary,
                    ),
                  ),
                  Text(
                    'Admin Panel',
                    style: TextStyle(fontSize: 10, color: isDark ? AppTheme.darkTextSecondary : Colors.grey[500]),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildWebSidebar() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? AppTheme.darkSurface : Colors.white;
    final borderCol = isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0);
    final width = _sidebarOpen ? 256.0 : 80.0;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      width: width,
      curve: Curves.easeInOut,
      decoration: BoxDecoration(
        color: cardBg,
        border: Border(right: BorderSide(color: borderCol)),
      ),
      child: Column(
        children: [
          // Sidebar Header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border(bottom: BorderSide(color: borderCol)),
            ),
            child: Row(
              mainAxisAlignment: _sidebarOpen
                  ? MainAxisAlignment.spaceBetween
                  : MainAxisAlignment.center,
              children: [
                if (_sidebarOpen)
                  SvgPicture.asset(
                    'assets/images/logo.svg',
                    height: 32,
                    colorFilter: const ColorFilter.mode(
                      AppTheme.primaryColor,
                      BlendMode.srcIn,
                    ),
                  )
                else
                  IconButton(
                    icon: SvgPicture.asset(
                      'assets/images/logo.svg',
                      height: 28,
                      colorFilter: const ColorFilter.mode(
                        AppTheme.primaryColor,
                        BlendMode.srcIn,
                      ),
                    ),
                    onPressed: () => setState(() => _sidebarOpen = true),
                  ),
                if (_sidebarOpen)
                  IconButton(
                    icon: const Icon(Icons.chevron_left, color: Colors.grey),
                    onPressed: () => setState(() => _sidebarOpen = false),
                  ),
              ],
            ),
          ),

          // Sidebar Navigation items
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 24),
              children: [
                _buildSidebarItem(
                  0,
                  'Dashboard',
                  Icons.dashboard_outlined,
                  Icons.dashboard,
                ),
                const SizedBox(height: 6),
                _buildSidebarItem(
                  1,
                  'News',
                  Icons.article_outlined,
                  Icons.article,
                ),
                const SizedBox(height: 6),
                _buildSidebarItem(
                  2,
                  'Categories',
                  Icons.category_outlined,
                  Icons.category,
                ),
                const SizedBox(height: 6),
                _buildSidebarItem(
                  3,
                  'Ads',
                  Icons.campaign_outlined,
                  Icons.campaign,
                ),
              ],
            ),
          ),

          // Sidebar Bottom Drawer
          Container(
            decoration: BoxDecoration(
              border: Border(top: BorderSide(color: borderCol)),
            ),
            padding: const EdgeInsets.all(12),
            child: Column(
              children: [
                if (_sidebarOpen)
                  ListTile(
                    leading: const Icon(Icons.logout, color: Colors.grey),
                    title: const Text(
                      'Logout',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    hoverColor: isDark ? AppTheme.crimsonColor.withOpacity(0.1) : Colors.red[50],
                    onTap: _showLogoutDialog,
                  )
                else ...[
                  IconButton(
                    icon: const Icon(Icons.logout, color: Colors.grey),
                    onPressed: _showLogoutDialog,
                    tooltip: 'Logout',
                  ),
                  IconButton(
                    icon: const Icon(Icons.chevron_right, color: Colors.grey),
                    onPressed: () => setState(() => _sidebarOpen = true),
                    tooltip: 'Expand',
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSidebarItem(
    int index,
    String label,
    IconData icon,
    IconData activeIcon,
  ) {
    final isActive = _selectedIndex == index;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return InkWell(
      onTap: () => _changeTab(index),
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: _sidebarOpen
            ? const EdgeInsets.symmetric(horizontal: 16, vertical: 12)
            : const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isActive
              ? (isDark ? AppTheme.primaryColor.withOpacity(0.15) : const Color(0xFF0F172A))
              : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisAlignment: _sidebarOpen
              ? MainAxisAlignment.start
              : MainAxisAlignment.center,
          children: [
            Icon(
              isActive ? activeIcon : icon,
              color: isActive
                  ? (isDark ? AppTheme.primaryColor : Colors.white)
                  : Colors.grey[600],
              size: 20,
            ),
            if (_sidebarOpen) ...[
              const SizedBox(width: 12),
              Text(
                label,
                style: TextStyle(
                  color: isActive
                      ? (isDark ? AppTheme.primaryColor : Colors.white)
                      : (isDark ? AppTheme.darkTextSecondary : Colors.grey[700]),
                  fontSize: 13,
                  fontWeight: isActive ? FontWeight.bold : FontWeight.w500,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildCustomBottomNavBar() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? AppTheme.darkSurface : Colors.white;
    final borderCol = isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0);
    final textSecondary = isDark ? AppTheme.darkTextSecondary : const Color(0xFF64748B);

    final navItems = [
      _NavItem(Icons.dashboard_outlined, Icons.dashboard_rounded, 'Overview'),
      _NavItem(Icons.article_outlined, Icons.article_rounded, 'News'),
      _NavItem(Icons.category_outlined, Icons.category_rounded, 'Categories'),
      _NavItem(Icons.campaign_outlined, Icons.campaign_rounded, 'Ads'),
    ];

    return SafeArea(
      child: Container(
        height: 64,
        margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: borderCol, width: 1),
          boxShadow: [
            BoxShadow(
              color: isDark ? Colors.black.withOpacity(0.3) : const Color(0xFF0F172A).withOpacity(0.08),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: List.generate(navItems.length, (index) {
                final item = navItems[index];
                final isSelected = _selectedIndex == index;

                return Expanded(
                  child: GestureDetector(
                    onTap: () => _changeTab(index),
                    behavior: HitTestBehavior.opaque,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 250),
                          curve: Curves.easeInOut,
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? AppTheme.primaryColor.withOpacity(0.08)
                                : Colors.transparent,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(
                            isSelected ? item.activeIcon : item.inactiveIcon,
                            color: isSelected
                                ? AppTheme.primaryColor
                                : textSecondary,
                            size: 22,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          item.label,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                            color: isSelected
                                ? AppTheme.primaryColor
                                : textSecondary,
                            letterSpacing: 0.2,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }),
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem {
  final IconData inactiveIcon;
  final IconData activeIcon;
  final String label;

  _NavItem(this.inactiveIcon, this.activeIcon, this.label);
}

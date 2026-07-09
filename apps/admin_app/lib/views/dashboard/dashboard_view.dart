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

    return Scaffold(
      appBar: isWideScreen
          ? AppBar(
              title: Text(_titles[_selectedIndex]),
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
                ],
                IconButton(
                  icon: const Icon(
                    Icons.logout_outlined,
                    color: AppTheme.dangerColor,
                  ),
                  tooltip: 'Sign Out',
                  onPressed: _showLogoutDialog,
                ),
                const SizedBox(width: 12),
              ],
            )
          : null, // Custom sticky header on mobile
      body: Column(
        children: [
          if (!isWideScreen) _buildMobileHeader(),
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
      bottomNavigationBar: isWideScreen
          ? null
          : BottomNavigationBar(
              currentIndex: _selectedIndex,
              onTap: _changeTab,
              type: BottomNavigationBarType.fixed,
              selectedItemColor: const Color(0xFF0F172A),
              unselectedItemColor: Colors.grey,
              items: const [
                BottomNavigationBarItem(
                  icon: Icon(Icons.dashboard_outlined),
                  activeIcon: Icon(Icons.dashboard),
                  label: 'Dashboard',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.article_outlined),
                  activeIcon: Icon(Icons.article),
                  label: 'News',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.category_outlined),
                  activeIcon: Icon(Icons.category),
                  label: 'Categories',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.campaign_outlined),
                  activeIcon: Icon(Icons.campaign),
                  label: 'Ads',
                ),
              ],
            ),
    );
  }

  Widget _buildMobileHeader() {
    return Container(
      height: 80,
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: SvgPicture.asset(
                  'assets/images/logo.svg',
                  fit: BoxFit.contain,
                ),
              ),
              const SizedBox(width: 12),
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'ThirdEye News',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.lightTextPrimary,
                    ),
                  ),
                  Text(
                    'Admin Panel',
                    style: TextStyle(fontSize: 10, color: Colors.grey[500]),
                  ),
                ],
              ),
            ],
          ),
          IconButton(
            icon: const Icon(
              Icons.logout_outlined,
              color: AppTheme.dangerColor,
            ),
            onPressed: _showLogoutDialog,
          ),
        ],
      ),
    );
  }

  Widget _buildWebSidebar() {
    final width = _sidebarOpen ? 256.0 : 80.0;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      width: width,
      curve: Curves.easeInOut,
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(right: BorderSide(color: Color(0xFFE2E8F0))),
      ),
      child: Column(
        children: [
          // Sidebar Header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9))),
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
            decoration: const BoxDecoration(
              border: Border(top: BorderSide(color: Color(0xFFF1F5F9))),
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
                    hoverColor: Colors.red[50],
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

    return InkWell(
      onTap: () => _changeTab(index),
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: _sidebarOpen
            ? const EdgeInsets.symmetric(horizontal: 16, vertical: 12)
            : const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFF0F172A) : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisAlignment: _sidebarOpen
              ? MainAxisAlignment.start
              : MainAxisAlignment.center,
          children: [
            Icon(
              isActive ? activeIcon : icon,
              color: isActive ? Colors.white : Colors.grey[600],
              size: 20,
            ),
            if (_sidebarOpen) ...[
              const SizedBox(width: 12),
              Text(
                label,
                style: TextStyle(
                  color: isActive ? Colors.white : Colors.grey[700],
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
}

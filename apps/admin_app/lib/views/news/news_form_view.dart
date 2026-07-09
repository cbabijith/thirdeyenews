import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../models/news.dart';
import '../../viewmodels/news_viewmodel.dart';
import '../../viewmodels/category_viewmodel.dart';
import '../../config/theme.dart';

class NewsFormView extends ConsumerStatefulWidget {
  final News? initialArticle;

  const NewsFormView({super.key, this.initialArticle});

  @override
  ConsumerState<NewsFormView> createState() => _NewsFormViewState();
}

class _NewsFormViewState extends ConsumerState<NewsFormView> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _contentController = TextEditingController();
  final _descController = TextEditingController();
  final _youtubeController = TextEditingController();

  String? _selectedCategoryId;
  String? _selectedSubcategoryId;
  bool _isPublished = false;
  bool _isPinned = false;
  
  File? _pickedImageFile;
  String? _remoteImageUrl;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialArticle != null) {
      final article = widget.initialArticle!;
      _titleController.text = article.title;
      _contentController.text = article.content;
      _descController.text = article.description ?? '';
      _youtubeController.text = article.youtubeLink ?? '';
      _selectedCategoryId = article.categoryId;
      _selectedSubcategoryId = article.subcategoryId;
      _isPublished = article.isPublished;
      _isPinned = article.isPinned;
      _remoteImageUrl = article.imageUrl;
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    _descController.dispose();
    _youtubeController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      setState(() {
        _pickedImageFile = File(pickedFile.path);
        _remoteImageUrl = null;
      });
    }
  }

  void _removeImage() {
    setState(() {
      _pickedImageFile = null;
      _remoteImageUrl = null;
    });
  }

  Future<void> _saveForm() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);

    final article = News(
      id: widget.initialArticle?.id ?? '',
      title: _titleController.text.trim(),
      content: _contentController.text.trim(),
      description: _descController.text.trim().isEmpty ? null : _descController.text.trim(),
      youtubeLink: _youtubeController.text.trim().isEmpty ? null : _youtubeController.text.trim(),
      categoryId: _selectedCategoryId,
      subcategoryId: _selectedSubcategoryId,
      isPublished: _isPublished,
      isPinned: _isPinned,
      imageUrl: _remoteImageUrl,
      createdAt: widget.initialArticle?.createdAt ?? DateTime.now(),
      publishedAt: _isPublished 
          ? (widget.initialArticle?.publishedAt ?? DateTime.now())
          : null,
    );

    final notifier = ref.read(newsViewModelProvider.notifier);
    final success = widget.initialArticle == null
        ? await notifier.createArticle(article, _pickedImageFile)
        : await notifier.updateArticle(widget.initialArticle!.id, article, _pickedImageFile);

    setState(() => _isSaving = false);
    if (mounted) {
      if (success) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Article saved successfully!')));
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('An error occurred. Please try again.')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final categoryState = ref.watch(categoryViewModelProvider);
    final isWide = MediaQuery.of(context).size.width > 900;
    
    final filteredSubs = categoryState.subcategories
        .where((sub) => sub.categoryId == _selectedCategoryId)
        .toList();

    final mainContent = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Editor Section Card
        Card(
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              children: [
                TextFormField(
                  controller: _titleController,
                  decoration: const InputDecoration(
                    labelText: 'Article Title *',
                    hintText: 'Untitled',
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    filled: false,
                  ),
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  validator: (value) => value == null || value.trim().isEmpty ? 'Title is required' : null,
                ),
                const Divider(height: 32, color: Color(0xFFE2E8F0)),
                TextFormField(
                  controller: _contentController,
                  maxLines: 12,
                  decoration: const InputDecoration(
                    labelText: 'Content body *',
                    hintText: 'Write article content here...',
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    filled: false,
                    alignLabelWithHint: true,
                  ),
                  style: const TextStyle(fontSize: 14, height: 1.6),
                  validator: (value) => value == null || value.trim().isEmpty ? 'Content is required' : null,
                ),
              ],
            ),
          ),
        ),
      ],
    );

    final settingsSidebar = Column(
      children: [
        // Publish Options Card
        _buildCard(
          title: 'Publish Settings',
          icon: Icons.auto_awesome,
          children: [
            SwitchListTile(
              title: const Text('Publish Immediately', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
              subtitle: const Text('Live & visible in public feeds', style: TextStyle(fontSize: 11)),
              value: _isPublished,
              dense: true,
              contentPadding: EdgeInsets.zero,
              activeColor: AppTheme.accentColor,
              onChanged: (val) => setState(() => _isPublished = val),
            ),
            const Divider(color: Color(0xFFF1F5F9)),
            SwitchListTile(
              title: const Text('Pin to Homepage', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
              subtitle: const Text('Feature on home top banner', style: TextStyle(fontSize: 11)),
              value: _isPinned,
              dense: true,
              contentPadding: EdgeInsets.zero,
              activeColor: AppTheme.primaryColor,
              onChanged: (val) => setState(() => _isPinned = val),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Organization Settings Card
        _buildCard(
          title: 'Organization',
          icon: Icons.folder_outlined,
          children: [
            DropdownButtonFormField<String>(
              value: _selectedCategoryId,
              decoration: const InputDecoration(labelText: 'Category'),
              items: categoryState.categories.map((cat) {
                return DropdownMenuItem(value: cat.id, child: Text(cat.name, style: const TextStyle(fontSize: 13)));
              }).toList(),
              onChanged: (val) {
                setState(() {
                  _selectedCategoryId = val;
                  _selectedSubcategoryId = null;
                });
              },
            ),
            if (_selectedCategoryId != null && filteredSubs.isNotEmpty) ...[
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: _selectedSubcategoryId,
                decoration: const InputDecoration(labelText: 'Subcategory'),
                items: filteredSubs.map((sub) {
                  return DropdownMenuItem(value: sub.id, child: Text(sub.name, style: const TextStyle(fontSize: 13)));
                }).toList(),
                onChanged: (val) => setState(() => _selectedSubcategoryId = val),
              ),
            ],
            const SizedBox(height: 12),
            TextFormField(
              controller: _descController,
              decoration: const InputDecoration(labelText: 'Short Description'),
              maxLines: 2,
              style: const TextStyle(fontSize: 13),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Media Settings Card
        _buildCard(
          title: 'Media',
          icon: Icons.image_outlined,
          children: [
            const Text('Featured Image', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
            const SizedBox(height: 8),
            _buildImagePicker(),
            const SizedBox(height: 12),
            TextFormField(
              controller: _youtubeController,
              decoration: const InputDecoration(
                labelText: 'YouTube Video Link',
                prefixIcon: Icon(Icons.link, size: 18),
              ),
              style: const TextStyle(fontSize: 13),
            ),
          ],
        ),
      ],
    );

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.initialArticle == null ? 'Create Article' : 'Edit Article'),
        actions: [
          if (_isSaving)
            const Center(child: Padding(padding: EdgeInsets.only(right: 16.0), child: CircularProgressIndicator()))
          else
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0F172A),
                foregroundColor: Colors.white,
                minimumSize: const Size(120, 40),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
              ),
              onPressed: _saveForm,
              icon: const Icon(Icons.check, size: 16),
              label: Text(widget.initialArticle == null ? 'Publish' : 'Save'),
            ),
          const SizedBox(width: 16),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: isWide
              ? Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(flex: 3, child: mainContent),
                    const SizedBox(width: 20),
                    SizedBox(width: 320, child: settingsSidebar),
                  ],
                )
              : Column(
                  children: [
                    mainContent,
                    const SizedBox(height: 16),
                    settingsSidebar,
                  ],
                ),
        ),
      ),
    );
  }

  Widget _buildCard({
    required String title,
    required IconData icon,
    required List<Widget> children,
  }) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, size: 16, color: const Color(0xFF64748B)),
                const SizedBox(width: 8),
                Text(
                  title.toUpperCase(),
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF64748B),
                    letterSpacing: 0.5,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildImagePicker() {
    if (_pickedImageFile != null) {
      return _imagePreview(Image.file(_pickedImageFile!, fit: BoxFit.cover));
    } else if (_remoteImageUrl != null && _remoteImageUrl!.isNotEmpty) {
      return _imagePreview(Image.network(_remoteImageUrl!, fit: BoxFit.cover));
    }

    return InkWell(
      onTap: _pickImage,
      child: Container(
        height: 120,
        width: double.infinity,
        decoration: BoxDecoration(
          color: const Color(0xFFF8FAFC),
          border: Border.all(color: const Color(0xFFE2E8F0), width: 1.5),
          borderRadius: BorderRadius.circular(8),
        ),
        child: const Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.add_photo_alternate_outlined, size: 36, color: Colors.grey),
            SizedBox(height: 6),
            Text('Click to upload image', style: TextStyle(color: Colors.grey, fontSize: 12)),
          ],
        ),
      ),
    );
  }

  Widget _imagePreview(Widget imageWidget) {
    return Stack(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: SizedBox(
            height: 140,
            width: double.infinity,
            child: imageWidget,
          ),
        ),
        Positioned(
          top: 6,
          right: 6,
          child: InkWell(
            onTap: _removeImage,
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: const BoxDecoration(
                color: Colors.black54,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.close, size: 16, color: Colors.white),
            ),
          ),
        ),
      ],
    );
  }
}

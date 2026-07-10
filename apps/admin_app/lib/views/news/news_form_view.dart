import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:quill_html_editor/quill_html_editor.dart';
import '../../config/theme.dart';
import '../../models/news.dart';
import '../../viewmodels/news_viewmodel.dart';
import '../../viewmodels/category_viewmodel.dart';
import '../../providers.dart';

class NewsFormView extends ConsumerStatefulWidget {
  final News? initialArticle;

  const NewsFormView({super.key, this.initialArticle});

  @override
  ConsumerState<NewsFormView> createState() => _NewsFormViewState();
}

class _NewsFormViewState extends ConsumerState<NewsFormView> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  late QuillEditorController _quillController;

  final _descController = TextEditingController();
  final _youtubeController = TextEditingController();
  final _slugController = TextEditingController();
  final _adLinkController = TextEditingController();

  String? _selectedCategoryId;
  String? _selectedSubcategoryId;
  bool _isPublished = false;
  bool _isPinned = false;
  
  File? _pickedImageFile;
  String? _remoteImageUrl;
  File? _pickedAdImageFile;
  String? _remoteAdImageUrl;
  bool _isSaving = false;
  bool _isLoadingDetails = false;
  String _initialHtml = '';
  double _editorHeight = 300;

  @override
  void initState() {
    super.initState();
    _quillController = QuillEditorController();
    
    if (widget.initialArticle != null) {
      final article = widget.initialArticle!;
      _titleController.text = article.title;
      _initialHtml = article.content;
      _descController.text = article.description ?? '';
      _youtubeController.text = article.youtubeLink ?? '';
      _slugController.text = article.slug ?? '';
      _adLinkController.text = article.adLinkUrl ?? '';
      _selectedCategoryId = article.categoryId;
      _selectedSubcategoryId = article.subcategoryId;
      _isPublished = article.isPublished;
      _isPinned = article.isPinned;
      _remoteImageUrl = article.imageUrl;
      _remoteAdImageUrl = article.adImageUrl;
      
      // Asynchronously fetch complete article details from API
      _loadFullArticleDetails();
    }
  }

  Future<void> _loadFullArticleDetails() async {
    if (widget.initialArticle == null) return;
    setState(() => _isLoadingDetails = true);
    try {
      final fullArticle = await ref.read(newsRepositoryProvider).getNewsById(widget.initialArticle!.id);
      if (fullArticle != null && mounted) {
        setState(() {
          _titleController.text = fullArticle.title;
          _initialHtml = fullArticle.content;
          _descController.text = fullArticle.description ?? '';
          _youtubeController.text = fullArticle.youtubeLink ?? '';
          _slugController.text = fullArticle.slug ?? '';
          _adLinkController.text = fullArticle.adLinkUrl ?? '';
          _selectedCategoryId = fullArticle.categoryId;
          _selectedSubcategoryId = fullArticle.subcategoryId;
          _isPublished = fullArticle.isPublished;
          _isPinned = fullArticle.isPinned;
          _remoteImageUrl = fullArticle.imageUrl;
          _remoteAdImageUrl = fullArticle.adImageUrl;
        });
        // Populate rich text editor with new fetched content
        _quillController.setText(_initialHtml);
      }
    } catch (_) {
      // Fallback to minimal data if server is down or error occurs
    } finally {
      if (mounted) {
        setState(() => _isLoadingDetails = false);
      }
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _quillController.dispose();
    _descController.dispose();
    _youtubeController.dispose();
    _slugController.dispose();
    _adLinkController.dispose();
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

  Future<void> _pickAdImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      setState(() {
        _pickedAdImageFile = File(pickedFile.path);
        _remoteAdImageUrl = null;
      });
    }
  }

  void _removeAdImage() {
    setState(() {
      _pickedAdImageFile = null;
      _remoteAdImageUrl = null;
    });
  }

  Future<void> _saveForm() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() => _isSaving = true);
    
    // Asynchronously fetch HTML string from the rich editor
    final contentHtml = await _quillController.getText();

    final article = News(
      id: widget.initialArticle?.id ?? '',
      title: _titleController.text.trim(),
      content: contentHtml.trim(),
      description: _descController.text.trim().isEmpty ? null : _descController.text.trim(),
      youtubeLink: _youtubeController.text.trim().isEmpty ? null : _youtubeController.text.trim(),
      categoryId: _selectedCategoryId,
      subcategoryId: _selectedSubcategoryId,
      slug: _slugController.text.trim().isEmpty ? null : _slugController.text.trim(),
      adImageUrl: _remoteAdImageUrl,
      adLinkUrl: _adLinkController.text.trim().isEmpty ? null : _adLinkController.text.trim(),
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
        ? await notifier.createArticle(article, _pickedImageFile, _pickedAdImageFile)
        : await notifier.updateArticle(widget.initialArticle!.id, article, _pickedImageFile, _pickedAdImageFile);

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

  Widget _buildWebPublishButton() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final containerBg = isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC);
    final borderColor = isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0);
    final textPrimary = isDark ? AppTheme.darkTextPrimary : const Color(0xFF1E293B);

    return InkWell(
      onTap: () {
        setState(() => _isPublished = !_isPublished);
      },
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: containerBg,
          border: Border.all(color: borderColor),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Publish',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: textPrimary),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    _isPublished ? 'Live & visible' : 'Saved as draft',
                    style: TextStyle(fontSize: 10, color: Colors.grey[600]),
                  ),
                ],
              ),
            ),
            Container(
              width: 36,
              height: 20,
              padding: const EdgeInsets.symmetric(horizontal: 2),
              decoration: BoxDecoration(
                color: _isPublished ? const Color(0xFF22C55E) : (isDark ? const Color(0xFF475569) : const Color(0xFFCBD5E1)),
                borderRadius: BorderRadius.circular(10),
              ),
              alignment: _isPublished ? Alignment.centerRight : Alignment.centerLeft,
              child: Container(
                width: 16,
                height: 16,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black12,
                      blurRadius: 1,
                      offset: Offset(0, 1),
                    )
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWebPinButton() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final containerBg = isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC);
    final borderColor = isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0);
    final textPrimary = isDark ? AppTheme.darkTextPrimary : const Color(0xFF1E293B);

    return InkWell(
      onTap: () {
        setState(() => _isPinned = !_isPinned);
      },
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: containerBg,
          border: Border.all(color: borderColor),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Pin to Home',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: textPrimary),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    _isPinned ? 'Featured on homepage' : 'Show in regular feed',
                    style: TextStyle(fontSize: 10, color: Colors.grey[600]),
                  ),
                ],
              ),
            ),
            Container(
              width: 36,
              height: 20,
              padding: const EdgeInsets.symmetric(horizontal: 2),
              decoration: BoxDecoration(
                color: _isPinned ? const Color(0xFF6366F1) : (isDark ? const Color(0xFF475569) : const Color(0xFFCBD5E1)),
                borderRadius: BorderRadius.circular(10),
              ),
              alignment: _isPinned ? Alignment.centerRight : Alignment.centerLeft,
              child: Container(
                width: 16,
                height: 16,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black12,
                      blurRadius: 1,
                      offset: Offset(0, 1),
                    )
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoadingDetails) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Edit Article'),
        ),
        body: const Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    final categoryState = ref.watch(categoryViewModelProvider);
    final isWide = MediaQuery.of(context).size.width > 900;
    
    final filteredSubs = categoryState.subcategories
        .where((sub) => sub.categoryId == _selectedCategoryId)
        .toList();

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? AppTheme.darkSurface : Colors.white;
    final borderColor = isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0);
    final textPrimary = isDark ? AppTheme.darkTextPrimary : const Color(0xFF0F172A);

    final mainContent = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Editor Section Card
        Card(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: BorderSide(color: borderColor),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Title Input Header Label
              const Padding(
                padding: EdgeInsets.only(left: 20.0, right: 20.0, top: 20.0),
                child: Text(
                  'ARTICLE TITLE',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF64748B), // Slate 500
                    letterSpacing: 0.5,
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
                child: TextFormField(
                  controller: _titleController,
                  decoration: const InputDecoration(
                    hintText: 'Enter title here...',
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    filled: false,
                    contentPadding: EdgeInsets.zero,
                  ),
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: textPrimary),
                  validator: (value) => value == null || value.trim().isEmpty ? 'Title is required' : null,
                ),
              ),
              const SizedBox(height: 8),
              
              // Custom Detached Toolbar (Only Bold and Bullet List)
              ToolBar(
                controller: _quillController,
                toolBarConfig: const [
                  ToolBarStyle.bold,
                  ToolBarStyle.listBullet,
                ],
                toolBarColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC), // Slate 50
                activeIconColor: isDark ? Colors.white : const Color(0xFF0F172A),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                iconSize: 20,
              ),
              
              // Content Input Header Label
              const Padding(
                padding: EdgeInsets.only(left: 20.0, right: 20.0, top: 16.0),
                child: Text(
                  'ARTICLE CONTENT',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF64748B), // Slate 500
                    letterSpacing: 0.5,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              
              // QuillHtmlEditor WYSIWYG Panel
              ClipRRect(
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(12),
                  bottomRight: Radius.circular(12),
                ),
                child: SizedBox(
                  height: _editorHeight,
                  child: QuillHtmlEditor(
                    controller: _quillController,
                    hintText: 'Enter content here...',
                    isEnabled: true,
                    minHeight: 300,
                    backgroundColor: cardBg,
                    textStyle: TextStyle(
                      color: isDark ? Colors.white : Colors.black,
                      fontSize: 14,
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    hintTextPadding: const EdgeInsets.symmetric(horizontal: 20),
                    hintTextStyle: const TextStyle(
                      color: Color(0xFF94A3B8), // Slate 400 (visible grey)
                      fontSize: 14,
                    ),
                    onEditorCreated: () {
                      if (_initialHtml.isNotEmpty) {
                        _quillController.setText(_initialHtml);
                      }
                    },
                    onEditorResized: (height) {
                      if (height >= 300 && height != _editorHeight) {
                        setState(() {
                          _editorHeight = height;
                        });
                      }
                    },
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );

    final settingsSidebar = Column(
      children: [
        // Publish Options Card (Web aligned)
        _buildCard(
          title: 'Publish Settings',
          icon: Icons.auto_awesome,
          children: [
            _buildWebPublishButton(),
            const SizedBox(height: 12),
            _buildWebPinButton(),
          ],
        ),
        const SizedBox(height: 16),

        // URL Settings Card
        _buildCard(
          title: 'URL Settings',
          icon: Icons.link_outlined,
          children: [
            TextFormField(
              controller: _slugController,
              decoration: const InputDecoration(
                labelText: 'Custom Link Slug (Optional)',
                hintText: 'e.g. crimekottayam34',
                helperText: 'Lowercase letters, numbers, and hyphens only.',
              ),
              style: const TextStyle(fontSize: 13),
              inputFormatters: [
                FilteringTextInputFormatter.allow(RegExp(r'[a-zA-Z0-9-]')),
              ],
              onChanged: (val) {
                final lowercase = val.toLowerCase();
                if (lowercase != val) {
                  _slugController.value = _slugController.value.copyWith(
                    text: lowercase,
                    selection: TextSelection.collapsed(offset: lowercase.length),
                  );
                }
              },
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
        const SizedBox(height: 16),

        // In-Article Ad Card
        _buildCard(
          title: 'In-Article Ad',
          icon: Icons.campaign_outlined,
          children: [
            _buildAdImagePicker(),
            const SizedBox(height: 12),
            TextFormField(
              controller: _adLinkController,
              decoration: const InputDecoration(
                labelText: 'Ad Redirect Link',
                hintText: 'https://example.com',
                prefixIcon: Icon(Icons.link, size: 18),
              ),
              style: const TextStyle(fontSize: 13),
              keyboardType: TextInputType.url,
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
                backgroundColor: isDark ? AppTheme.primaryColor : const Color(0xFF0F172A),
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final borderColor = isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0);

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
        side: BorderSide(color: borderColor),
      ),
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
                    fontSize: 10,
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
      return _imagePreview(Image.file(_pickedImageFile!, fit: BoxFit.contain));
    } else if (_remoteImageUrl != null && _remoteImageUrl!.isNotEmpty) {
      return _imagePreview(Image.network(_remoteImageUrl!, fit: BoxFit.contain));
    }

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final borderColor = isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1);
    final bg = isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC);
    final textPrimary = isDark ? AppTheme.darkTextPrimary : const Color(0xFF334155);
    final textSecondary = isDark ? AppTheme.darkTextSecondary : const Color(0xFF64748B);

    return InkWell(
      onTap: _pickImage,
      child: Container(
        height: 140,
        width: double.infinity,
        decoration: BoxDecoration(
          color: bg,
          border: Border.all(color: borderColor, width: 1.5),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.image_search_outlined, size: 32, color: textSecondary),
            const SizedBox(height: 8),
            Text(
              'Featured Image',
              style: TextStyle(color: textPrimary, fontSize: 13, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Text(
              'Click to select or upload',
              style: TextStyle(color: textSecondary, fontSize: 11),
            ),
          ],
        ),
      ),
    );
  }

  Widget _imagePreview(Widget imageWidget) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Stack(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: Container(
            height: 180,
            width: double.infinity,
            color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9), // Slate 100 background
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

  Widget _buildAdImagePicker() {
    if (_pickedAdImageFile != null) {
      return _adImagePreview(Image.file(_pickedAdImageFile!, fit: BoxFit.contain));
    } else if (_remoteAdImageUrl != null && _remoteAdImageUrl!.isNotEmpty) {
      return _adImagePreview(Image.network(_remoteAdImageUrl!, fit: BoxFit.contain));
    }

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final borderColor = isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1);
    final bg = isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC);
    final textPrimary = isDark ? AppTheme.darkTextPrimary : const Color(0xFF334155);
    final textSecondary = isDark ? AppTheme.darkTextSecondary : const Color(0xFF64748B);

    return InkWell(
      onTap: _pickAdImage,
      child: Container(
        height: 140,
        width: double.infinity,
        decoration: BoxDecoration(
          color: bg,
          border: Border.all(color: borderColor, width: 1.5),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.add_photo_alternate_outlined, size: 32, color: textSecondary),
            const SizedBox(height: 8),
            Text(
              'Ad Image (Optional)',
              style: TextStyle(color: textPrimary, fontSize: 13, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Text(
              'Click to select or upload',
              style: TextStyle(color: textSecondary, fontSize: 11),
            ),
          ],
        ),
      ),
    );
  }

  Widget _adImagePreview(Widget imageWidget) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Stack(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: Container(
            height: 180,
            width: double.infinity,
            color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9), // Slate 100 background
            child: imageWidget,
          ),
        ),
        Positioned(
          top: 6,
          right: 6,
          child: InkWell(
            onTap: _removeAdImage,
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

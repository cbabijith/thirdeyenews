import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:quill_html_editor/quill_html_editor.dart';
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

  String? _selectedCategoryId;
  String? _selectedSubcategoryId;
  bool _isPublished = false;
  bool _isPinned = false;
  
  File? _pickedImageFile;
  String? _remoteImageUrl;
  bool _isSaving = false;
  bool _isLoadingDetails = false;
  String _initialHtml = '';

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
      _selectedCategoryId = article.categoryId;
      _selectedSubcategoryId = article.subcategoryId;
      _isPublished = article.isPublished;
      _isPinned = article.isPinned;
      _remoteImageUrl = article.imageUrl;
      
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
          _selectedCategoryId = fullArticle.categoryId;
          _selectedSubcategoryId = fullArticle.subcategoryId;
          _isPublished = fullArticle.isPublished;
          _isPinned = fullArticle.isPinned;
          _remoteImageUrl = fullArticle.imageUrl;
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

  Widget _buildWebPublishButton() {
    return InkWell(
      onTap: () {
        setState(() => _isPublished = !_isPublished);
      },
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: _isPublished ? const Color(0xFFF0FDF4) : const Color(0xFFF8FAFC),
          border: Border.all(
            color: _isPublished ? const Color(0xFF86EFAC) : const Color(0xFFE2E8F0),
          ),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: _isPublished ? const Color(0xFF22C55E) : const Color(0xFFE2E8F0),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Icon(
                Icons.language,
                size: 16,
                color: _isPublished ? Colors.white : const Color(0xFF94A3B8),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Publish',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
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
                color: _isPublished ? const Color(0xFF22C55E) : const Color(0xFFCBD5E1),
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
    return InkWell(
      onTap: () {
        setState(() => _isPinned = !_isPinned);
      },
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: _isPinned ? const Color(0xFFEEF2FF) : const Color(0xFFF8FAFC),
          border: Border.all(
            color: _isPinned ? const Color(0xFFC7D2FE) : const Color(0xFFE2E8F0),
          ),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: _isPinned ? const Color(0xFF6366F1) : const Color(0xFFE2E8F0),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Icon(
                Icons.push_pin,
                size: 16,
                color: _isPinned ? Colors.white : const Color(0xFF94A3B8),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Pin to Home',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
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
                color: _isPinned ? const Color(0xFF6366F1) : const Color(0xFFCBD5E1),
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

    final mainContent = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Editor Section Card
        Card(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: const BorderSide(color: Color(0xFFE2E8F0)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Title Input
              Padding(
                padding: const EdgeInsets.only(left: 20.0, right: 20.0, top: 20.0),
                child: TextFormField(
                  controller: _titleController,
                  decoration: const InputDecoration(
                    hintText: 'Untitled',
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    filled: false,
                    contentPadding: EdgeInsets.zero,
                  ),
                  style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                  validator: (value) => value == null || value.trim().isEmpty ? 'Title is required' : null,
                ),
              ),
              const SizedBox(height: 12),
              
              // Custom Detached Toolbar (Only Bold and Bullet List)
              ToolBar(
                controller: _quillController,
                toolBarConfig: const [
                  ToolBarStyle.bold,
                  ToolBarStyle.listBullet,
                ],
                toolBarColor: const Color(0xFFF8FAFC), // Slate 50
                activeIconColor: const Color(0xFF0F172A),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                iconSize: 20,
              ),
              
              // QuillHtmlEditor WYSIWYG Panel
              ClipRRect(
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(12),
                  bottomRight: Radius.circular(12),
                ),
                child: SizedBox(
                  height: 400,
                  child: QuillHtmlEditor(
                    controller: _quillController,
                    hintText: 'Write article content here...',
                    isEnabled: true,
                    minHeight: 300,
                    backgroundColor: Colors.white,
                    onEditorCreated: () {
                      if (_initialHtml.isNotEmpty) {
                        _quillController.setText(_initialHtml);
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
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
        side: const BorderSide(color: Color(0xFFE2E8F0)),
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
      return _imagePreview(Image.file(_pickedImageFile!, fit: BoxFit.cover));
    } else if (_remoteImageUrl != null && _remoteImageUrl!.isNotEmpty) {
      return _imagePreview(Image.network(_remoteImageUrl!, fit: BoxFit.cover));
    }

    return InkWell(
      onTap: _pickImage,
      child: Container(
        height: 140,
        width: double.infinity,
        decoration: BoxDecoration(
          color: const Color(0xFFF8FAFC),
          border: Border.all(color: const Color(0xFFCBD5E1), width: 1.5),
          borderRadius: BorderRadius.circular(10),
        ),
        child: const Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.image_search_outlined, size: 32, color: Color(0xFF64748B)),
            SizedBox(height: 8),
            Text(
              'Featured Image',
              style: TextStyle(color: Color(0xFF334155), fontSize: 13, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 4),
            Text(
              'Click to select or upload',
              style: TextStyle(color: Color(0xFF64748B), fontSize: 11),
            ),
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

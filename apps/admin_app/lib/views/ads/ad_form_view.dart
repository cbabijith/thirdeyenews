import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../models/ad.dart';
import '../../viewmodels/ad_viewmodel.dart';
import '../../config/theme.dart';

class AdFormView extends ConsumerStatefulWidget {
  final Ad? initialAd;

  const AdFormView({super.key, this.initialAd});

  @override
  ConsumerState<AdFormView> createState() => _AdFormViewState();
}

class _AdFormViewState extends ConsumerState<AdFormView> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _linkController = TextEditingController();
  final _orderController = TextEditingController(text: '0');

  String _selectedPosition = 'main_banner';
  bool _isActive = true;
  
  File? _pickedImageFile;
  String? _remoteImageUrl;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialAd != null) {
      final ad = widget.initialAd!;
      _titleController.text = ad.title;
      _linkController.text = ad.linkUrl ?? '';
      _orderController.text = ad.displayOrder.toString();
      _selectedPosition = ad.position;
      _isActive = ad.isActive;
      _remoteImageUrl = ad.imageUrl;
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _linkController.dispose();
    _orderController.dispose();
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
    if (_pickedImageFile == null && _remoteImageUrl == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select an ad image')),
      );
      return;
    }

    setState(() => _isSaving = true);

    final adItem = Ad(
      id: widget.initialAd?.id ?? '',
      title: _titleController.text.trim(),
      linkUrl: _linkController.text.trim().isEmpty ? null : _linkController.text.trim(),
      imageUrl: _remoteImageUrl ?? '',
      position: _selectedPosition,
      displayOrder: int.tryParse(_orderController.text) ?? 0,
      isActive: _isActive,
      createdAt: widget.initialAd?.createdAt ?? DateTime.now(),
    );

    final notifier = ref.read(adViewModelProvider.notifier);
    final success = widget.initialAd == null
        ? await notifier.createAd(adItem, _pickedImageFile)
        : await notifier.updateAd(widget.initialAd!.id, adItem, _pickedImageFile);

    setState(() => _isSaving = false);
    if (mounted) {
      if (success) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Ad saved successfully!')));
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to save ad.')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isWide = MediaQuery.of(context).size.width > 900;

    final mainFields = Column(
      children: [
        // Information Card
        _buildCard(
          title: 'Ad Information',
          icon: Icons.info_outline,
          children: [
            TextFormField(
              controller: _titleController,
              decoration: const InputDecoration(
                labelText: 'Ad Title *',
                hintText: 'Enter title for reference',
              ),
              validator: (value) => value == null || value.trim().isEmpty ? 'Title is required' : null,
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _selectedPosition,
              decoration: const InputDecoration(labelText: 'Banner Position'),
              items: const [
                DropdownMenuItem(value: 'main_banner', child: Text('Main Banner (Home & News)')),
                DropdownMenuItem(value: 'bottom_nav', child: Text('Bottom Nav Banner (Only 1 active)')),
              ],
              onChanged: (val) {
                if (val != null) setState(() => _selectedPosition = val);
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _linkController,
              decoration: const InputDecoration(
                labelText: 'Click Redirect URL (Optional)',
                prefixIcon: Icon(Icons.link, size: 18),
              ),
              keyboardType: TextInputType.url,
            ),
          ],
        ),
      ],
    );

    final settingsSidebar = Column(
      children: [
        // Display & Status Card
        _buildCard(
          title: 'Status & Priority',
          icon: Icons.tune,
          children: [
            SwitchListTile(
              title: const Text('Active status', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
              subtitle: const Text('Show this ad in selected feeds', style: TextStyle(fontSize: 11)),
              value: _isActive,
              dense: true,
              contentPadding: EdgeInsets.zero,
              activeColor: AppTheme.accentColor,
              onChanged: (val) => setState(() => _isActive = val),
            ),
            const Divider(color: Color(0xFFF1F5F9)),
            TextFormField(
              controller: _orderController,
              decoration: const InputDecoration(labelText: 'Display Order Priority'),
              keyboardType: TextInputType.number,
              style: const TextStyle(fontSize: 13),
              validator: (value) => value == null || int.tryParse(value) == null ? 'Enter valid number' : null,
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Image Card
        _buildCard(
          title: 'Ad Media',
          icon: Icons.image_outlined,
          children: [
            const Text('Banner Image *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
            const SizedBox(height: 8),
            _buildImagePicker(),
          ],
        ),
      ],
    );

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.initialAd == null ? 'Create Advertisement' : 'Edit Advertisement'),
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
              label: Text(widget.initialAd == null ? 'Publish' : 'Save'),
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
                    Expanded(flex: 3, child: mainFields),
                    const SizedBox(width: 20),
                    SizedBox(width: 320, child: settingsSidebar),
                  ],
                )
              : Column(
                  children: [
                    mainFields,
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
      return _imagePreview(Image.file(_pickedImageFile!, fit: BoxFit.contain));
    } else if (_remoteImageUrl != null && _remoteImageUrl!.isNotEmpty) {
      return _imagePreview(Image.network(_remoteImageUrl!, fit: BoxFit.contain));
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
            Text('Select banner image', style: TextStyle(color: Colors.grey, fontSize: 12)),
          ],
        ),
      ),
    );
  }

  Widget _imagePreview(Widget imageWidget) {
    return Stack(
      children: [
        Container(
          height: 140,
          width: double.infinity,
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(8),
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

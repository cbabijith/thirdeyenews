# ThirdEye News Monorepo

A monorepo containing user/admin websites (Next.js) and user/admin apps (Flutter) with Supabase integration.

## Project Structure

```
thirdeyenews/
├── apps/
│   ├── user-website/          # Next.js 16.2.6 - User-facing website
│   ├── admin-website/          # Next.js 16.2.6 - Admin dashboard
│   ├── user-app/               # Flutter 3.44.0 - User mobile app
│   └── admin-app/              # Flutter 3.44.0 - Admin mobile app
├── packages/
│   └── shared-supabase/        # Shared Supabase client package
├── package.json                # Root package.json with workspace scripts
├── pnpm-workspace.yaml         # PNPM workspace configuration
└── README.md
```

## Prerequisites

- **Node.js**: >= 18.0.0
- **PNPM**: >= 8.0.0
- **Flutter**: 3.44.0
- **Supabase**: Create a project at [supabase.com](https://supabase.com)

## Installation

### 1. Install PNPM (if not already installed)

```bash
npm install -g pnpm@8.15.0
```

### 2. Install Node.js Dependencies

```bash
pnpm install
```

### 3. Install Flutter Dependencies

For each Flutter app, navigate to the app directory and run:

```bash
# User App
cd apps/user-app
flutter pub get

# Admin App
cd apps/admin-app
flutter pub get
```

## Environment Setup

### Next.js Websites

Create `.env.local` files in both website directories:

**apps/user-website/.env.local**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**apps/admin-website/.env.local**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Flutter Apps

Update the Supabase credentials in the `main.dart` files:

**apps/user-app/lib/main.dart**
```dart
await Supabase.initialize(
  url: 'YOUR_SUPABASE_URL',
  anonKey: 'YOUR_SUPABASE_ANON_KEY',
);
```

**apps/admin-app/lib/main.dart**
```dart
await Supabase.initialize(
  url: 'YOUR_SUPABASE_URL',
  anonKey: 'YOUR_SUPABASE_ANON_KEY',
);
```

## Development

### Next.js Websites

#### Run Both Websites
```bash
pnpm dev
```

#### Run User Website Only
```bash
pnpm dev:user-web
```

#### Run Admin Website Only
```bash
pnpm dev:admin-web
```

#### Build Websites
```bash
pnpm build
```

#### Build Individual Websites
```bash
pnpm build:user-web
pnpm build:admin-web
```

### Flutter Apps

#### Run User App
```bash
cd apps/user-app
flutter run
```

#### Run Admin App
```bash
cd apps/admin-app
flutter run
```

#### Build Flutter Apps
```bash
# User App
cd apps/user-app
flutter build apk  # Android
flutter build ios  # iOS

# Admin App
cd apps/admin-app
flutter build apk  # Android
flutter build ios  # iOS
```

## Available Scripts

### Root Scripts
- `pnpm dev` - Run both Next.js websites concurrently
- `pnpm dev:user-web` - Run user website only
- `pnpm dev:admin-web` - Run admin website only
- `pnpm build` - Build both Next.js websites
- `pnpm build:user-web` - Build user website only
- `pnpm build:admin-web` - Build admin website only
- `pnpm lint` - Lint both Next.js websites
- `pnpm typecheck` - Type check both Next.js websites
- `pnpm clean` - Clean all build artifacts and node_modules

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `docs/supabase-schema.sql` in your Supabase SQL editor
3. The schema includes:
   - `categories` table for organizing news
   - `news` table with support for images, YouTube links, and full text content
   - Storage bucket for image uploads
   - Row Level Security policies
4. Get your project URL and anon key from Supabase settings
5. Add them to the environment files as shown above

## Features

### Admin Website
- **Category Management**: Create, edit, and delete news categories
- **News Management**: Full CRUD operations for news articles
- **Image Upload**: Upload images directly to Supabase Storage
- **YouTube Integration**: Add YouTube video links to news articles
- **Rich Content**: Support for full article text content
- **Publishing Control**: Draft and publish workflow with publish/unpublish toggle
- **Dashboard**: Overview of recent news and categories

### User Website
- **Category Navigation**: Browse news by category
- **Rich News Display**: Images, videos, and full article content
- **YouTube Integration**: Embedded YouTube video links
- **Responsive Design**: Mobile-friendly layout
- **Published Content Only**: Only shows published news items

### Flutter Apps
- **User App**: 
  - Category filtering with horizontal scroll
  - Image display with error handling
  - YouTube video launching
  - Full content display
  - Refresh functionality
- **Admin App**:
  - News management on mobile
  - Publish/unpublish toggle
  - Category display
  - Image preview
  - Delete functionality

## Technology Stack

### Websites (Next.js)
- **Framework**: Next.js 16.2.6
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Package Manager**: PNPM (workspaces)
- **Runtime**: Node.js >= 18.0.0

### Apps (Flutter)
- **Framework**: Flutter 3.44.0
- **Language**: Dart
- **Database**: Supabase (supabase_flutter)
- **Package Manager**: pub
- **Platforms**: Android, iOS

## Notes

- The monorepo uses PNPM workspaces for efficient dependency management
- Shared Supabase client is located in `packages/shared-supabase`
- Both websites share the same Supabase project
- Both apps share the same Supabase project
- TypeScript errors shown in IDE will resolve after running `pnpm install`
- Flutter apps require additional platform-specific setup for iOS/Android

## Troubleshooting

### Next.js Websites
- If you see module not found errors, run `pnpm install` in the root directory
- Ensure you have created the `.env.local` files with valid Supabase credentials

### Flutter Apps
- Ensure Flutter 3.44.0 is installed: `flutter --version`
- Run `flutter doctor` to check for any missing dependencies
- For iOS development, you need a Mac with Xcode installed
- For Android development, ensure Android Studio and SDK are properly configured

## License

MIT

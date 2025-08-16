# Android App Structure

This directory contains the Android-specific implementation of MangaAI.

## Architecture

- **React Native**: Cross-platform framework maintaining web app functionality
- **Native Modules**: Android-specific features for file management, OCR, and media playback
- **Repository Compatibility**: Full support for Aniyomi/Komikku repository formats
- **Offline Support**: Local storage for manga/anime content and reading progress

## Key Features

- Repository management compatible with Aniyomi/Komikku sources
- AI-powered OCR translation with overlay support
- Advanced video player with VLC-like controls
- Offline reading and streaming capabilities
- NSFW content filtering and parental controls
- Modern Material Design 3 UI following Android 16 guidelines

## Build Process

1. React Native development server
2. Android build tools compilation
3. APK generation for distribution
4. Play Store deployment support
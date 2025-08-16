# MangaAI Android App

A comprehensive manga reader and anime streaming Android application that surpasses Komikku and Aniyomi with modern UI design and advanced AI capabilities.

## Features

### 🎨 Modern UI Design
- **Material Design 3**: Following Android 16 design guidelines
- **Gemini Aesthetics**: Clean, modern interface inspired by Google's design language
- **Comick Layout**: Familiar layout for manga/comic readers
- **Dark/Light Themes**: Automatic theme switching with custom color schemes

### 📚 Manga Reading
- **AI-Powered OCR Translation**: Real-time text recognition and translation
- **Translation Overlay**: Non-intrusive translation bubbles over original text
- **Multiple Reading Modes**: Single page or continuous scroll
- **Progress Tracking**: Automatic reading progress sync
- **Offline Reading**: Download chapters for offline access

### 🎬 Anime Streaming
- **Advanced Video Player**: VLC-like controls with gesture support
- **Quality Selection**: 480p to 4K with adaptive streaming
- **Subtitle Support**: Multiple language subtitle tracks
- **Playback Speed Control**: 0.25x to 2x playback speed
- **Picture-in-Picture**: Continue watching while using other apps

### 🔗 Repository Management
- **Aniyomi Compatibility**: Full support for Aniyomi extension repositories
- **Komikku Compatibility**: Support for Komikku-style source repositories
- **NSFW Filtering**: Parental controls and content filtering
- **Source Management**: Enable/disable individual sources
- **Auto Updates**: Automatic repository and source updates

### 📱 Native Android Features
- **Background Downloads**: Download content while app is closed
- **Notification System**: Download progress and completion notifications
- **File Management**: Organized storage for manga and anime content
- **Hardware Integration**: Volume key navigation, back gesture support
- **Adaptive Icons**: Dynamic icons for Android 13+

## Architecture

### Frontend (React Native)
- **React Native 0.72+**: Latest React Native with new architecture
- **TypeScript**: Full type safety throughout the application
- **React Navigation**: Bottom tabs + stack navigation
- **React Context**: State management for theme, auth, and repositories
- **AsyncStorage**: Local data persistence

### Backend Integration
- **Repository APIs**: RESTful APIs for repository and source management
- **Authentication**: Session-based authentication with Replit Auth
- **File Storage**: Local and cloud storage for downloaded content
- **AI Services**: OpenAI integration for translation services

### Native Modules
- **OCR Engine**: Google ML Kit text recognition
- **Video Player**: ExoPlayer for high-quality video playback
- **File System**: React Native FS for file management
- **Permissions**: Runtime permission handling
- **Background Tasks**: WorkManager for background downloads

## Installation

### Development Setup
1. **Install Dependencies**:
   ```bash
   cd android
   npm install
   ```

2. **Android Setup**:
   ```bash
   npx react-native run-android
   ```

3. **Start Metro Bundler**:
   ```bash
   npm start
   ```

### Building for Production
1. **Generate Signed APK**:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

2. **Install on Device**:
   ```bash
   adb install app/build/outputs/apk/release/app-release.apk
   ```

## Repository Compatibility

### Supported Formats
- **Aniyomi Extensions**: Full compatibility with Aniyomi extension repository format
- **Tachiyomi Extensions**: Support for manga extension repositories
- **Custom Repositories**: JSON-based repository definitions
- **GitHub Releases**: Direct installation from GitHub release assets

### Adding Repositories
1. Open the Sources tab
2. Tap the + button
3. Enter repository URL (GitHub, GitLab, or direct JSON)
4. Repository will be validated and sources will be loaded automatically

### Example Repository URLs
- Tachiyomi: `https://github.com/tachiyomiorg/tachiyomi-extensions`
- Aniyomi: `https://github.com/aniyomiorg/aniyomi-extensions`
- Custom: `https://example.com/repository.json`

## Configuration

### Theme Configuration
Themes are configured in `src/constants/Colors.ts`:
- Light/dark color schemes
- Material Design 3 color tokens
- App-specific color overrides
- Gradient definitions

### Repository Settings
Repository behavior can be configured:
- Update frequency
- Download quality preferences
- NSFW content filtering
- Source priority ordering

## Performance

### Optimization Features
- **Lazy Loading**: Components and images loaded on demand
- **Memory Management**: Efficient image caching and cleanup
- **Background Processing**: OCR and downloads in background threads
- **Storage Optimization**: Compressed downloads and smart caching

### System Requirements
- **Android Version**: 7.0 (API level 24) or higher
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 1GB free space for app and cache
- **Network**: WiFi or mobile data for streaming/downloading

## Contributing

### Development Guidelines
1. Follow TypeScript strict mode
2. Use React Navigation for screen transitions
3. Implement proper error handling
4. Add loading states for async operations
5. Test on multiple screen sizes

### Code Structure
```
android/src/
├── components/        # Reusable UI components
├── contexts/          # React contexts for state management
├── screens/           # Main app screens
├── services/          # API and native module services
├── utils/             # Utility functions
├── constants/         # Theme colors and app constants
└── navigation/        # Navigation configuration
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and feature requests, please create an issue on the repository or contact the development team.
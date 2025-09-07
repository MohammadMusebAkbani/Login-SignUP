# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a React Native application built with Expo that demonstrates a login/authentication flow with an interactive video player. The app is called "TrackerOps" and features:

- Authentication screens (Login/SignUp)
- Interactive video player with drawing annotations and commenting
- Cross-platform support (iOS, Android, Web)

## Development Commands

### Core Development
- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator  
- `npm run web` - Run in web browser

### Package Management
- `npm install` - Install dependencies
- `npx expo install <package>` - Install Expo-compatible packages

### Building
- `npx expo build:android` - Build Android APK
- `npx expo build:ios` - Build iOS app
- `npx expo prebuild` - Generate native code for development builds

## Architecture Overview

### Navigation Structure
The app uses React Navigation v7 with a Stack Navigator:
- **Initial Route**: "Video" screen (currently set as default)
- **Login Screen**: Authentication with email/password
- **SignUp Screen**: User registration with organization details
- **Video Screen**: Interactive video player with commenting and drawing

### Component Architecture

#### Screen Organization
```
screens/
├── Authentication/
│   ├── Login.jsx       # Login form with email/password
│   └── SignUp.jsx      # Registration with user details
└── Video/
    └── Video.js        # Interactive video player
```

#### Reusable Components
```
components/common/
├── Label.js            # Text label wrapper
├── TextInput.js        # Input with password visibility toggle
├── PrimaryButton.js    # Generic touchable button
└── SecondaryButton.js  # Button with image/icon support
```

### Video Player Features
The Video screen (`screens/Video/Video.js`) is the most complex component with:
- **Expo Video Integration**: Uses expo-video for playback
- **Drawing Overlay**: SVG-based drawing with color selection and path tracking
- **Comment System**: Timestamped comments with AsyncStorage persistence
- **Timeline Markers**: Visual indicators for comment positions
- **PanResponder**: Handles touch gestures for drawing functionality

### State Management
- **Local State**: Uses React hooks (useState, useEffect) for component state
- **Persistence**: AsyncStorage for comments and drawings
- **Navigation State**: React Navigation handles screen transitions

### Key Dependencies
- **expo**: ~53.0.22 (main framework)
- **react-native**: 0.79.6
- **@react-navigation/native**: ^7.1.17 (navigation)
- **expo-video**: Video playback
- **react-native-svg**: Drawing overlay
- **@react-native-async-storage/async-storage**: Data persistence
- **react-native-vector-icons**: Icons for UI elements

## Development Patterns

### Component Structure
- Components use functional components with hooks
- Consistent prop destructuring pattern
- StyleSheet objects defined at component level
- Platform-specific handling (iOS/Android differences)

### Styling Approach  
- Inline styles mixed with StyleSheet objects
- Color scheme: Primary blue (#6366f1), dark themes for video player
- KeyboardAvoidingView for form screens
- Responsive design considerations

### File Naming
- Screens: PascalCase (Login.jsx, SignUp.jsx)
- Components: PascalCase (TextInput.js, PrimaryButton.js)
- Mixed file extensions (.js, .jsx) - consider standardizing

### Data Flow
- Props passed down for reusable components
- Local state for form inputs and UI state
- AsyncStorage for persistent data (comments, drawings)
- Navigation params for screen communication

## Platform Considerations

### Expo Configuration
- **Package**: com.musebakbani.LoginApp
- **New Architecture**: Enabled (React Native's new architecture)
- **Edge-to-Edge**: Android edge-to-edge display support
- **Plugins**: expo-video, expo-audio

### Platform Differences
- KeyboardAvoidingView behavior differs between iOS/Android
- Different padding offsets for keyboard handling
- Touch handling varies between platforms

## Notable Implementation Details

### Video Drawing System
- Uses PanResponder for touch gesture detection
- SVG Path elements for drawing persistence  
- Color palette selection with visual feedback
- Timestamp-based drawing association with video playback

### Authentication Flow
- Form validation through controlled inputs
- Password visibility toggle with FontAwesome icons
- Navigation between Login/SignUp screens
- Google authentication placeholder (not implemented)

### Component Reusability
Common components are designed for reuse across screens:
- TextInput handles both regular and secure text entry
- PrimaryButton for text-only buttons
- SecondaryButton for buttons with icons/images
- Label component for consistent text styling

This architecture supports rapid development while maintaining consistency across the application.

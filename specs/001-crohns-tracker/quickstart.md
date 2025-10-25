# Quickstart Guide: Crohns Symptom Tracker

**Date**: 2025-10-25
**Feature**: Crohns Symptom Tracker
**Phase**: Development Setup & Implementation Guide

## Prerequisites

### Development Environment
- **Node.js**: Version 18+ (LTS recommended)
- **npm/yarn**: Latest version
- **Expo CLI**: Global installation via `npm install -g @expo/cli`
- **Git**: For version control
- **Code Editor**: VS Code with React Native extensions recommended

### Mobile Development Tools
- **iOS**: Xcode 14+ (macOS only) or Expo Go app
- **Android**: Android Studio or Expo Go app
- **Device/Emulator**: Physical device recommended for testing

### Recommended VS Code Extensions
- React Native Tools
- TypeScript Hero
- ESLint
- Prettier
- SQLite Viewer
- Expo Tools

## Project Setup

### 1. Initialize Expo Project
```bash
# Create new Expo project with TypeScript template
npx create-expo-app crohns-tracker --template blank-typescript

# Navigate to project directory
cd crohns-tracker

# Install additional dependencies
npm install expo-router expo-sqlite drizzle-orm zustand react-hook-form @react-native-async-storage/async-storage react-native-calendars
```

### 2. Configure Expo Router
```bash
# Install Expo Router and dependencies
npx expo install expo-router react-native-safe-area-context react-native-screens

# Create app directory structure
mkdir -p app/(tabs) app/entry src/{components,screens,db,stores,services,types,utils,hooks} __tests__/{components,screens,services,utils,e2e}
```

### 3. Development Dependencies
```bash
# Install development and testing dependencies
npm install -D jest @testing-library/react-native @testing-library/jest-native detox drizzle-kit eslint-plugin-react-native-a11y @types/jest
```

## Configuration Files

### 1. Expo Router Configuration (`expo-router.json`)
```json
{
  "expo": {
    "scheme": "crohns-tracker"
  }
}
```

### 2. Drizzle Configuration (`drizzle.config.ts`)
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'expo',
});
```

### 3. TypeScript Configuration (`tsconfig.json`)
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/screens/*": ["src/screens/*"],
      "@/services/*": ["src/services/*"],
      "@/stores/*": ["src/stores/*"],
      "@/types/*": ["src/types/*"],
      "@/utils/*": ["src/utils/*"],
      "@/hooks/*": ["src/hooks/*"]
    }
  }
}
```

### 4. ESLint Configuration (`.eslintrc.js`)
```javascript
module.exports = {
  extends: ['expo', '@react-native-community'],
  plugins: ['react-native-a11y'],
  rules: {
    'react-native-a11y/has-accessibility-props': 'warn',
    'react-native-a11y/has-valid-accessibility-role': 'warn',
  },
};
```

## Core Implementation Steps

### Phase 1: Database Setup
1. **Create Database Schema** (`src/db/schema.ts`)
   - Define Drizzle tables for entries, bowel movements, and notes
   - Set up foreign key relationships
   - Add validation constraints

2. **Database Client** (`src/db/client.ts`)
   - Initialize SQLite connection
   - Set up Drizzle ORM instance
   - Configure migrations

3. **Migrations** (`src/db/migrations/`)
   - Create initial migration scripts
   - Set up schema versioning

### Phase 2: State Management
1. **Entry Store** (`src/stores/entryStore.ts`)
   - CRUD operations for entries
   - Local data synchronization
   - Error handling

2. **UI Store** (`src/stores/uiStore.ts`)
   - Calendar state management
   - Form state and validation
   - Navigation state

3. **Export Store** (`src/stores/exportStore.ts`)
   - Export progress tracking
   - File generation and sharing

### Phase 3: Core Services
1. **Entry Service** (`src/services/entryService.ts`)
   - Database operations wrapper
   - Data validation and transformation
   - Business logic implementation

2. **Export Service** (`src/services/exportService.ts`)
   - CSV/TXT export generation
   - File sharing integration
   - Data formatting utilities

3. **Validation Service** (`src/services/validationService.ts`)
   - Input validation rules
   - Bristol scale and urgency validation
   - Date/time validation

### Phase 4: UI Components
1. **Calendar Component** (`src/components/Calendar/`)
   - Custom calendar with entry indicators
   - Date selection and navigation
   - Accessibility support

2. **Timeline Component** (`src/components/Timeline/`)
   - Daily entry timeline view
   - Entry type icons and formatting
   - Smooth scrolling and performance

3. **Form Components** (`src/components/Forms/`)
   - Bowel movement entry form
   - Note entry form
   - Validation feedback

### Phase 5: Screens
1. **Calendar Screen** (`src/screens/CalendarScreen/`)
   - Main calendar interface
   - Entry overview
   - Quick action buttons

2. **Timeline Screen** (`src/screens/TimelineScreen/`)
   - Daily detailed view
   - Entry management
   - Edit/delete operations

3. **Entry Form Screen** (`src/screens/EntryFormScreen/`)
   - Create/edit entry forms
   - Type selection
   - Validation and submission

4. **Export Screen** (`src/screens/ExportScreen/`)
   - Export configuration
   - Progress tracking
   - Share functionality

## Testing Strategy

### Unit Tests
```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Integration Tests
```bash
# Run integration tests
npm run test:integration

# Test specific screen
npm test -- --testPathPattern=CalendarScreen
```

### End-to-End Tests
```bash
# Setup Detox
npx detox init

# Build test app
npx detox build --configuration ios.sim.debug

# Run E2E tests
npx detox test --configuration ios.sim.debug
```

## Development Workflow

### 1. Start Development Server
```bash
# Start Expo development server
npx expo start

# Start with specific platform
npx expo start --ios
npx expo start --android
```

### 2. Database Development
```bash
# Generate migration
npx drizzle-kit generate:sqlite

# Push schema changes
npx drizzle-kit push:sqlite

# View database in studio (development)
npx drizzle-kit studio
```

### 3. Type Checking
```bash
# Run TypeScript compiler
npx tsc --noEmit

# Watch mode
npx tsc --noEmit --watch
```

## Build and Deployment

### 1. Development Builds
```bash
# Create development build
npx expo install expo-dev-client
npx expo run:ios
npx expo run:android
```

### 2. Production Builds
```bash
# Configure app.json for production
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build for both platforms
eas build --platform all
```

### 3. Testing Builds
```bash
# Install on device
eas build --platform ios --profile preview
eas submit --platform ios --latest
```

## Performance Optimization

### Bundle Analysis
```bash
# Analyze bundle size
npx expo export

# Bundle visualization
npx @expo/bundle-analyzer dist/
```

### Performance Monitoring
- Use React DevTools Profiler
- Monitor memory usage during timeline scrolling
- Optimize FlatList performance with proper props
- Implement image optimization for calendar icons

## Troubleshooting

### Common Issues
1. **SQLite Connection**: Ensure expo-sqlite is properly installed
2. **Navigation**: Verify Expo Router configuration and file structure
3. **TypeScript**: Check path aliases in tsconfig.json
4. **Performance**: Profile timeline component with many entries
5. **Accessibility**: Test with screen readers on both platforms

### Debug Tools
- Flipper for React Native debugging
- React Native Debugger
- Drizzle Studio for database inspection
- Expo DevTools for build analysis

This quickstart guide provides a comprehensive foundation for implementing the Crohns Symptom Tracker with the specified technology stack and architectural patterns.
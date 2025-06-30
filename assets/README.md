# Assets Directory

This directory contains static assets for the ElaraV2 app.

## Required Files

- `icon.png` - App icon (1024x1024px)
- `splash.png` - Splash screen image
- `adaptive-icon.png` - Android adaptive icon (1024x1024px)
- `favicon.png` - Web favicon (32x32px)

## Placeholder Assets

For development, you can use simple placeholder images. The app will work without custom icons, using default Expo assets.

To generate proper icons and splash screens, you can use:
```bash
npx expo install expo-splash-screen
npx expo install @expo/image-utils
```

Then use the Expo CLI to generate assets:
```bash
npx expo customize --template icon
npx expo customize --template splash
``` 
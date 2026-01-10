# Favicon Setup Guide

This directory contains favicon configuration files for BZION Hub Digital.

## Files Included

- `browserconfig.xml` - Windows tile configuration
- `manifest.json` - Web app manifest with Android icons configuration
- Favicon image files (placed in public directory):
  - `favicon.ico` - Main favicon (multiple sizes)
  - `favicon-16x16.png` - 16x16 PNG favicon
  - `favicon-32x32.png` - 32x32 PNG favicon
  - `favicon-96x96.png` - 96x96 PNG favicon
  - `apple-icon-180x180.png` - Apple touch icon
  - `apple-icon-57x57.png` - Apple icon 57x57
  - `apple-icon-60x60.png` - Apple icon 60x60
  - `apple-icon-72x72.png` - Apple icon 72x72
  - `apple-icon-76x76.png` - Apple icon 76x76
  - `apple-icon-114x114.png` - Apple icon 114x114
  - `apple-icon-120x120.png` - Apple icon 120x120
  - `apple-icon-144x144.png` - Apple icon 144x144
  - `apple-icon-152x152.png` - Apple icon 152x152
  - `android-icon-36x36.png` - Android icon 36x36
  - `android-icon-48x48.png` - Android icon 48x48
  - `android-icon-72x72.png` - Android icon 72x72
  - `android-icon-96x96.png` - Android icon 96x96
  - `android-icon-144x144.png` - Android icon 144x144
  - `android-icon-192x192.png` - Android icon 192x192
  - `ms-icon-70x70.png` - Microsoft tile 70x70
  - `ms-icon-150x150.png` - Microsoft tile 150x150
  - `ms-icon-310x310.png` - Microsoft tile 310x310

## Configuration

The favicon is configured in `src/app/layout.tsx` via Next.js Metadata API:

```typescript
export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      // ... more sizes
    ],
    apple: [
      { url: "/apple-icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
};
```

## Steps to Complete Favicon Setup

1. **Add favicon image files to `/public`**:
   - Download or generate favicon images in all required sizes
   - Place them in the `/public` directory
   - Ensure filenames match the references in `layout.tsx`

2. **Verify manifest.json**:
   - ✅ Already configured in `/public/manifest.json`
   - Update the manifest if needed for custom branding

3. **Verify browserconfig.xml**:
   - ✅ Already configured in `/public/browserconfig.xml`
   - Customize tile colors in the `<TileColor>` tag if needed

4. **Test**:
   - Build and deploy the application
   - Check favicon appears in browser tabs
   - Test on mobile devices (iOS and Android)

## Browser Compatibility

- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ iOS (Apple touch icon)
- ✅ Android (manifest icons)
- ✅ Windows (tile icons via browserconfig.xml)

## Tools to Generate Favicons

If you need to regenerate favicons from a source image:

- [realfavicongenerator.net](https://realfavicongenerator.net)
- [favicon.io](https://favicon.io)
- [convertio.co](https://convertio.co)

Simply upload your logo/image and download all required sizes.

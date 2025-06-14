# MindTube Extension Environment Configuration

## Overview

The MindTube extension has been configured to automatically use different API endpoints based on the build mode. This eliminates the need to manually change URLs when building for production.

## Configuration Details

### Environment Variables

The following environment variables are automatically injected by webpack during the build process:

- `process.env.API_BASE_URL` - Backend API endpoint
- `process.env.FRONTEND_URL` - Frontend dashboard URL  
- `process.env.NODE_ENV` - Build environment

### Build Modes

#### Development Mode (`npm run dev` or `npm run build` with `--mode development`)
- API_BASE_URL: `http://localhost:8000/api/v1`
- FRONTEND_URL: `http://localhost:5173`
- Source maps: Enabled
- Watch mode: Available with `npm run dev`

#### Production Mode (`npm run build` or `npm run package`)
- API_BASE_URL: `https://api.mindtube.duckdns.org/api/v1`
- FRONTEND_URL: `https://dashboard.mindtube.duckdns.org`
- Source maps: Disabled
- Optimized build

## Files Modified

The following files have been updated to use environment variables:

1. **webpack.config.js** - Added DefinePlugin to inject environment variables
2. **content.js** - Uses `process.env.API_BASE_URL`
3. **background.js** - Uses `process.env.API_BASE_URL` and `process.env.FRONTEND_URL`
4. **popup.js** - Uses `process.env.API_BASE_URL` and `process.env.FRONTEND_URL`
5. **js/iframe.js** - Uses `process.env.API_BASE_URL`
6. **manifest.json** - Added production API host permissions

## Usage

### For Development
```bash
cd extension
npm install
npm run dev  # Builds with localhost URLs and watches for changes
```

### For Production Release
```bash
cd extension
npm install
npm run package  # Builds with production URLs and creates zip file
```

The generated `release/mindtube-extension.zip` file will contain the extension with production URLs and can be uploaded to the Chrome Web Store.

## Verification

To verify the correct URLs are being used, check the generated files in the `dist/` directory after building. The environment variables should be replaced with the actual URLs based on the build mode.

## Troubleshooting

- Ensure Node.js and npm are installed
- Run `npm install` to install webpack dependencies
- Check that the `dist/` directory is created after building
- Verify the correct URLs appear in the bundled JavaScript files 
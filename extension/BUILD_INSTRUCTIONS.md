# MindTube Extension Build Instructions

## Environment Configuration

The extension automatically switches between development and production API endpoints based on the build mode:

### Development Mode
- API URL: `http://localhost:8000/api/v1`
- Frontend URL: `http://localhost:5173`
- Source maps: Enabled
- Webpack mode: `development`

### Production Mode
- API URL: `https://api.mindtube.duckdns.org/api/v1`
- Frontend URL: `https://dashboard.mindtube.duckdns.org`
- Source maps: Disabled
- Webpack mode: `production`

## Build Commands

### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Install Dependencies
```bash
cd extension
npm install
```

### Development Build (with watch mode)
```bash
npm run dev
```
This command:
- Builds the extension in development mode
- Enables source maps for debugging
- Watches for file changes and rebuilds automatically
- Uses localhost API endpoints

### Production Build
```bash
npm run build
```
This command:
- Builds the extension in production mode
- Optimizes the code and removes source maps
- Uses production API endpoints (`https://api.mindtube.duckdns.org`)

### Package for Release
```bash
npm run package
```
This command:
- Runs the production build
- Creates a `release/` directory
- Generates `mindtube-extension.zip` with all necessary files
- Ready for Chrome Web Store submission

## Files Included in Package
- `manifest.json`
- `popup.html`
- `iframe.html`
- `styles.css`
- `icons/` directory
- `font-awesome/` directory
- JavaScript libraries (`js/d3.min.js`, `js/markmap-lib.min.js`, `js/markmap-view.min.js`)
- Compiled JavaScript files (`dist/` directory)

## Configuration Files
- `webpack.config.js` - Contains environment variable injection logic
- `package.json` - Build scripts and dependencies

## Environment Variables Injected
- `process.env.API_BASE_URL` - Backend API endpoint
- `process.env.FRONTEND_URL` - Frontend dashboard URL
- `process.env.NODE_ENV` - Build environment (`development` or `production`)

## Testing
After building, you can load the extension in Chrome:
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension/` directory (for development) or extract and select the contents of the zip file (for production)

## Troubleshooting
- If build fails, ensure all dependencies are installed: `npm install`
- For permission errors, check file permissions in the extension directory
- For API connectivity issues, verify the backend server is running (development) or accessible (production) 
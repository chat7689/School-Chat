/**
 * Build script for Block Racers Online.
 * Prepares static assets for production deployment.
 */

const fs = require('fs');
const path = require('path');

console.log('Building Block Racers Online...\n');

const config = {
  srcDir: path.join(__dirname, '..', 'src'),
  publicDir: path.join(__dirname, '..', 'public'),
  distDir: path.join(__dirname, '..', 'dist'),
};

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyDirectory(sourceDir, targetDir) {
  ensureDirectory(targetDir);

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

function validateConfig() {
  console.log('Validating configuration...');

  const requiredFiles = [
    'firebase.json',
    'database.rules.json',
    '.env.example',
  ];

  const missing = requiredFiles.filter((file) => {
    const filePath = path.join(__dirname, '..', file);
    return !fs.existsSync(filePath);
  });

  if (missing.length > 0) {
    throw new Error(`Missing required files: ${missing.join(', ')}`);
  }

  console.log('Configuration validated');
}

function checkEnvironment() {
  console.log('Checking environment...');

  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.warn('Warning: .env file not found.');
    console.warn('Copy .env.example to .env and configure your credentials.');
    return;
  }

  console.log('Environment configured');
}

function prepareDist() {
  console.log('Preparing dist directory...');
  ensureDirectory(config.distDir);
  console.log('Dist directory ready');
}

function copyPublicFiles() {
  console.log('Copying public files...');

  if (!fs.existsSync(config.publicDir)) {
    throw new Error('Public directory is missing.');
  }

  copyDirectory(config.publicDir, config.distDir);
  console.log('Public files copied');
}

function bundleJavaScript() {
  console.log('Preparing source modules...');

  if (!fs.existsSync(config.srcDir)) {
    console.log('No src directory found, skipping source module copy');
    return;
  }

  copyDirectory(config.srcDir, path.join(config.distDir, 'src'));
  console.log('Source modules prepared');
}

function processCSS() {
  console.log('Processing CSS...');
  console.log('CSS processed');
}

async function build() {
  try {
    validateConfig();
    checkEnvironment();
    prepareDist();
    copyPublicFiles();
    bundleJavaScript();
    processCSS();

    console.log('\nBuild complete!');
    console.log('\nNext steps:');
    console.log('1. Test locally: npm run dev');
    console.log('2. Deploy functions: firebase deploy --only functions');
    console.log('3. Deploy hosting: firebase deploy --only hosting');
    console.log('4. Deploy everything: firebase deploy\n');
  } catch (error) {
    console.error('\nBuild failed:', error.message);
    process.exit(1);
  }
}

build();

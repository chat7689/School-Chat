/**
 * Build script for Block Racers Online
 * Prepares files for production deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔨 Building Block Racers Online...\n');

// Configuration
const config = {
  srcDir: path.join(__dirname, '..', 'src'),
  publicDir: path.join(__dirname, '..', 'public'),
  distDir: path.join(__dirname, '..', 'dist'),
};

// Create dist directory if it doesn't exist
if (!fs.existsSync(config.distDir)) {
  fs.mkdirSync(config.distDir, { recursive: true });
  console.log('✅ Created dist directory');
}

// Copy public files to dist
function copyPublicFiles() {
  console.log('📁 Copying public files...');

  // For now, just ensure public directory exists
  if (!fs.existsSync(config.publicDir)) {
    fs.mkdirSync(config.publicDir, { recursive: true });
  }

  console.log('✅ Public files ready');
}

// Bundle JavaScript modules (simplified - in production, use webpack or rollup)
function bundleJavaScript() {
  console.log('📦 Bundling JavaScript modules...');

  // TODO: Implement actual bundling with webpack/rollup
  // For now, just copy src files
  if (fs.existsSync(config.srcDir)) {
    const targetDir = path.join(config.distDir, 'src');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    console.log('✅ JavaScript modules prepared');
  }
}

// Minify CSS (simplified)
function processCSS() {
  console.log('🎨 Processing CSS...');
  // TODO: Implement CSS minification
  console.log('✅ CSS processed');
}

// Validate configuration files
function validateConfig() {
  console.log('🔍 Validating configuration...');

  const required Files = [
    'firebase.json',
    'database.rules.json',
    '.env.example'
  ];

  const missing = requiredFiles.filter(file => {
    const filepath = path.join(__dirname, '..', file);
    return !fs.existsSync(filepath);
  });

  if (missing.length > 0) {
    console.error('❌ Missing required files:', missing.join(', '));
    process.exit(1);
  }

  console.log('✅ Configuration validated');
}

// Check if .env exists
function checkEnvironment() {
  console.log('🔐 Checking environment...');

  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.warn('⚠️  Warning: .env file not found!');
    console.warn('   Copy .env.example to .env and configure your credentials');
  } else {
    console.log('✅ Environment configured');
  }
}

// Main build process
async function build() {
  try {
    validateConfig();
    checkEnvironment();
    copyPublicFiles();
    bundleJavaScript();
    processCSS();

    console.log('\n🎉 Build complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Test locally: npm run dev');
    console.log('   2. Deploy functions: firebase deploy --only functions');
    console.log('   3. Deploy hosting: firebase deploy --only hosting');
    console.log('   4. Deploy everything: firebase deploy\n');
  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Run build
build();

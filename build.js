const fs = require('fs');
const path = require('path');

// Create dist directory
const distDir = './dist';
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Create subdirectories
['css', 'js', 'assets', 'assets/images'].forEach(dir => {
    const fullPath = path.join(distDir, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

console.log('📁 Created build directories');

// Simple CSS minification
function minifyCSS(css) {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/;\s*}/g, '}') // Remove semicolon before closing brace
        .replace(/\s*{\s*/g, '{') // Remove spaces around opening brace
        .replace(/;\s*/g, ';') // Remove spaces after semicolon
        .replace(/,\s*/g, ',') // Remove spaces after comma
        .replace(/:\s*/g, ':') // Remove spaces after colon
        .trim();
}

// Simple JS minification
function minifyJS(js) {
    return js
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
        .replace(/\/\/.*$/gm, '') // Remove line comments
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/;\s*}/g, ';}') // Clean up semicolons
        .replace(/\s*{\s*/g, '{') // Remove spaces around braces
        .replace(/\s*}\s*/g, '}')
        .replace(/\s*;\s*/g, ';')
        .replace(/\s*,\s*/g, ',')
        .trim();
}

// Read and process CSS
console.log('🎨 Processing CSS...');
const cssContent = fs.readFileSync('./css/style.css', 'utf8');
const minifiedCSS = minifyCSS(cssContent);
fs.writeFileSync('./dist/css/style.css', minifiedCSS);
console.log(`✅ CSS minified: ${cssContent.length} → ${minifiedCSS.length} bytes`);

// Read and process JavaScript
console.log('⚡ Processing JavaScript...');
const jsContent = fs.readFileSync('./js/script.js', 'utf8');
const minifiedJS = minifyJS(jsContent);
fs.writeFileSync('./dist/js/script.js', minifiedJS);
console.log(`✅ JS minified: ${jsContent.length} → ${minifiedJS.length} bytes`);

// Process HTML
console.log('📄 Processing HTML...');
let htmlContent = fs.readFileSync('./index.html', 'utf8');

// Add cache busting and optimization meta tags
const timestamp = Date.now();
htmlContent = htmlContent
    .replace('css/style.css', `css/style.css?v=${timestamp}`)
    .replace('js/script.js', `js/script.js?v=${timestamp}`)
    .replace(/<head>/, `<head>
    <!-- Build optimized on ${new Date().toISOString()} -->
    <meta name="build-version" content="${timestamp}">`);

// Minify HTML (basic)
const minifiedHTML = htmlContent
    .replace(/>\s+</g, '><') // Remove spaces between tags
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();

fs.writeFileSync('./dist/index.html', minifiedHTML);
console.log(`✅ HTML processed: ${htmlContent.length} → ${minifiedHTML.length} bytes`);

// Copy assets (if any exist)
console.log('📸 Copying assets...');
if (fs.existsSync('./assets')) {
    const copyRecursive = (src, dest) => {
        if (fs.statSync(src).isDirectory()) {
            if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest, { recursive: true });
            }
            fs.readdirSync(src).forEach(item => {
                copyRecursive(path.join(src, item), path.join(dest, item));
            });
        } else {
            fs.copyFileSync(src, dest);
        }
    };
    
    copyRecursive('./assets', './dist/assets');
    console.log('✅ Assets copied');
} else {
    console.log('ℹ️  No assets to copy');
}

// Copy other necessary files
const filesToCopy = ['.gitignore', 'README.md', 'package.json'];
filesToCopy.forEach(file => {
    if (fs.existsSync(file)) {
        fs.copyFileSync(file, path.join(distDir, file));
        console.log(`✅ Copied ${file}`);
    }
});

// Generate build report
const buildReport = {
    buildTime: new Date().toISOString(),
    version: timestamp,
    files: {
        'index.html': fs.statSync('./dist/index.html').size,
        'css/style.css': fs.statSync('./dist/css/style.css').size,
        'js/script.js': fs.statSync('./dist/js/script.js').size
    },
    totalSize: fs.statSync('./dist/index.html').size + 
               fs.statSync('./dist/css/style.css').size + 
               fs.statSync('./dist/js/script.js').size
};

fs.writeFileSync('./dist/build-report.json', JSON.stringify(buildReport, null, 2));

console.log('\n🎉 Build completed successfully!');
console.log('📊 Build Report:');
console.log(`   Total size: ${(buildReport.totalSize / 1024).toFixed(2)} KB`);
console.log(`   Build version: ${timestamp}`);
console.log(`   Output directory: ./dist/`);
console.log('\n🚀 Ready for deployment!');
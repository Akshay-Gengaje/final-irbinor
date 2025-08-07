const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');
const Terser = require('terser');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');

// Define paths
const srcDir = path.join(__dirname, '../src');
const publicDir = path.join(__dirname, '../public');

// Ensure public directories exist
const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// Copy and minify CSS
const minifyCSS = async () => {
    const cssInput = path.join(srcDir, 'assets/css/tailwind.css');
    const cssOutputDir = path.join(publicDir, 'assets/css');
    const cssOutput = path.join(cssOutputDir, 'tailwind.css');

    ensureDir(cssOutputDir);
    const cssContent = fs.readFileSync(cssInput, 'utf8');
    const minified = new CleanCSS({}).minify(cssContent).styles;
    fs.writeFileSync(cssOutput, minified);
};

// Minify JS
const minifyJS = async () => {
    const jsInputDir = path.join(srcDir, 'assets/js');
    const jsOutputDir = path.join(publicDir, 'assets/js');

    ensureDir(jsOutputDir);
    const jsFiles = fs.readdirSync(jsInputDir).filter(file => file.endsWith('.js'));

    for (const file of jsFiles) {
        const jsContent = fs.readFileSync(path.join(jsInputDir, file), 'utf8');
        const minified = await Terser.minify(jsContent);
        fs.writeFileSync(path.join(jsOutputDir, file), minified.code);
    }
};

// Optimize images
const optimizeImages = async () => {
    const imageInputDir = path.join(srcDir, 'assets/images');
    const imageOutputDir = path.join(publicDir, 'assets/images');

    ensureDir(imageOutputDir);
    try {
        const imageminFn = imagemin.default || imagemin; // Handle ESM default export
        await imageminFn([`${imageInputDir}/*.{jpg,png}`], {
            destination: imageOutputDir,
            plugins: [
                (imageminJpegtran.default || imageminJpegtran)(),
                (imageminPngquant.default || imageminPngquant)({ quality: [0.6, 0.8] }),
            ],
        });
        console.log('Images optimized successfully!');
    } catch (error) {
        console.error('Error optimizing images:', error);
        throw error; // Rethrow to prevent build from succeeding on failure
    }
};

// Copy HTML files
const copyHTML = () => {
    const htmlOutputDir = path.join(publicDir);
    ensureDir(htmlOutputDir);

    // Copy index.html
    fs.copyFileSync(path.join(srcDir, 'index.html'), path.join(publicDir, 'index.html'));

    // Copy pages
    const pagesDir = path.join(srcDir, 'pages');
    const pagesOutputDir = path.join(publicDir, 'pages');
    ensureDir(pagesOutputDir);

    if (fs.existsSync(pagesDir)) {
        const htmlFiles = fs.readdirSync(pagesDir).filter(file => file.endsWith('.html'));
        for (const file of htmlFiles) {
            fs.copyFileSync(path.join(pagesDir, file), path.join(pagesOutputDir, file));
        }
    }
};

// Run build process
(async () => {
    console.log('Building project...');
    try {
        ensureDir(publicDir);
        await Promise.all([
            minifyCSS(),
            minifyJS(),
            optimizeImages(),
            copyHTML(),
        ]);
        console.log('Build completed successfully!');
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1); // Exit with failure code
    }
})();
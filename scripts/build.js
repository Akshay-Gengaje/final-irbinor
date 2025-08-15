const fs = require("fs");
const path = require("path");
const CleanCSS = require("clean-css");
const Terser = require("terser");
const imagemin = require("imagemin");
const imageminJpegtran = require("imagemin-jpegtran");
const imageminPngquant = require("imagemin-pngquant");
const ffmpeg = require("fluent-ffmpeg");
// Define paths
const srcDir = path.join(__dirname, "../src");
const publicDir = path.join(__dirname, "../public");
const videoDir = "assets/videos";
// Ensure public directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};
// Compress Videos
async function compressVideos() {
  console.log("Compressing videos...");
  const videoInputDir = path.join(srcDir, videoDir);
  const videoOutputDir = path.join(publicDir, videoDir);

  // Use the existing helper function for consistency
  ensureDir(videoOutputDir);

  // Use readdirSync for consistency with other functions in the script
  const files = fs.readdirSync(videoInputDir);

  for (const file of files) {
    if (file.endsWith(".mp4")) {
      // FIX: Correctly join paths using the specific video input/output directories
      const inputPath = path.join(videoInputDir, file);
      const outputPath = path.join(videoOutputDir, file);

      // Using a Promise to wrap the event-based ffmpeg process is correct
      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .videoCodec("libx264")
          .audioCodec("aac")
          .outputOptions([
            "-crf 28", // Good balance of quality/size
            "-preset fast", // Good balance of speed/compression
            "-movflags +faststart", // Essential for web streaming
          ])
          .on("end", () => {
            console.log(`Compressed ${file}`);
            resolve();
          })
          .on("error", (err) => {
            console.error(`Error compressing ${file}:`, err.message);
            reject(err);
          })
          .save(outputPath);
      });
    }
  }
}
// Minify JS
const minifyJS = async () => {
  const jsInputDir = path.join(srcDir, "assets/js");
  const jsOutputDir = path.join(publicDir, "assets/js");

  ensureDir(jsOutputDir);
  const jsFiles = fs
    .readdirSync(jsInputDir)
    .filter((file) => file.endsWith(".js"));

  for (const file of jsFiles) {
    const jsContent = fs.readFileSync(path.join(jsInputDir, file), "utf8");
    const minified = await Terser.minify(jsContent);
    fs.writeFileSync(path.join(jsOutputDir, file), minified.code);
  }
};

// Optimize images
const optimizeImages = async () => {
  const imageInputDir = path.join(srcDir, "assets/images");
  const imageOutputDir = path.join(publicDir, "assets/images");

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
    console.log("Images optimized successfully!");
  } catch (error) {
    console.error("Error optimizing images:", error);
    throw error; // Rethrow to prevent build from succeeding on failure
  }
};
// Optimize icons
const optimizeIcons = async () => {
  const imageInputDir = path.join(srcDir, "assets/icons");
  const imageOutputDir = path.join(publicDir, "assets/icons");

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
    console.log("Images optimized successfully!");
  } catch (error) {
    console.error("Error optimizing images:", error);
    throw error; // Rethrow to prevent build from succeeding on failure
  }
};

// Copy HTML files
const copyHTML = () => {
  const htmlOutputDir = path.join(publicDir);
  ensureDir(htmlOutputDir);

  // Copy index.html
  fs.copyFileSync(
    path.join(srcDir, "index.html"),
    path.join(publicDir, "index.html")
  );

  // Copy pages
  const pagesDir = path.join(srcDir, "pages");
  const pagesOutputDir = path.join(publicDir, "pages");
  ensureDir(pagesOutputDir);

  if (fs.existsSync(pagesDir)) {
    const htmlFiles = fs
      .readdirSync(pagesDir)
      .filter((file) => file.endsWith(".html"));
    for (const file of htmlFiles) {
      fs.copyFileSync(
        path.join(pagesDir, file),
        path.join(pagesOutputDir, file)
      );
    }
  }
};

// Copy Fonts
const copyFonts = () => {
  console.log("Copying fonts...");
  const fontsInputDir = path.join(srcDir, "assets/fonts");
  const fontsOutputDir = path.join(publicDir, "assets/fonts");

  ensureDir(fontsOutputDir);

  if (fs.existsSync(fontsInputDir)) {
    const fontFiles = fs.readdirSync(fontsInputDir);
    for (const file of fontFiles) {
      fs.copyFileSync(
        path.join(fontsInputDir, file),
        path.join(fontsOutputDir, file)
      );
    }
    console.log("Fonts copied successfully!");
  } else {
    console.log("No fonts directory found. Skipping.");
  }
};

// Run build process
(async () => {
  console.log("Building project...");
  try {
    ensureDir(publicDir);
    await Promise.all([
      compressVideos(),
      optimizeIcons(),
      minifyJS(),
      optimizeImages(),
      copyHTML(),
      copyFonts(),
    ]);
    console.log("Build completed successfully!");
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1); // Exit with failure code
  }
})();

const fs = require("fs").promises;
const path = require("path");
const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");
const { minify: htmlMinify } = require("html-minifier-terser");
const { minify: jsMinify } = require("terser");
const svgo = require("svgo");

const srcDir = path.join(__dirname, "../src");
const publicDir = path.join(__dirname, "../public");

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== "EEXIST") {
      throw err;
    }
  }
}

// Check if file exists
async function fileExists(dest) {
  try {
    await fs.access(dest);
    return true;
  } catch {
    return false;
  }
}

// Process images recursively (optimized PNG, JPEG, WebP, AVIF)
async function processImagesRecursive(inputDir, outputDir) {
  await ensureDir(outputDir);
  const files = await fs.readdir(inputDir);
  const tasks = [];

  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);
    const stat = await fs.stat(inputPath);

    if (stat.isDirectory()) {
      tasks.push(processImagesRecursive(inputPath, outputPath));
    } else {
      const ext = path.extname(file).toLowerCase();
      const baseName = path.basename(file, ext);

      if ([".jpg", ".jpeg", ".png"].includes(ext)) {
        try {
          const sharpInstance = sharp(inputPath, { failOn: "none" });
          const processingTasks = [];

          // Original format
          if (!(await fileExists(outputPath))) {
            if (ext === ".png") {
              processingTasks.push(
                sharpInstance.clone().png({ quality: 90, compressionLevel: 9 }).toFile(outputPath)
              );
            } else {
              processingTasks.push(
                sharpInstance.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(outputPath)
              );
            }
          } else {
            console.log(`⏩ Skipped ${file} (already exists)`);
          }

          // WebP
          const webpPath = path.join(outputDir, `${baseName}.webp`);
          if (!(await fileExists(webpPath))) {
            processingTasks.push(
              sharpInstance.clone().webp({ quality: 80, nearLossless: true }).toFile(webpPath)
            );
          } else {
            console.log(`⏩ Skipped ${baseName}.webp (already exists)`);
          }

          // AVIF
          const avifPath = path.join(outputDir, `${baseName}.avif`);
          if (!(await fileExists(avifPath))) {
            processingTasks.push(
              sharpInstance.clone().avif({ quality: 65, effort: 4 }).toFile(avifPath)
            );
          } else {
            console.log(`⏩ Skipped ${baseName}.avif (already exists)`);
          }

          if (processingTasks.length > 0) {
            tasks.push(
              Promise.all(processingTasks).then(() =>
                console.log(`✅ Processed ${file}`)
              )
            );
          }
        } catch (err) {
          console.error(`❌ Error processing ${file}:`, err.message);
        }
      } else if (ext === ".svg") {
        if (!(await fileExists(outputPath))) {
          tasks.push(
            optimizeSvg(inputPath, outputPath).then(() =>
              console.log(`✅ Processed SVG ${file}`)
            )
          );
        } else {
          console.log(`⏩ Skipped SVG ${file} (already exists)`);
        }
      } else {
        if (!(await fileExists(outputPath))) {
          await fs.copyFile(inputPath, outputPath);
          console.log(`✅ Copied ${file}`);
        } else {
          console.log(`⏩ Skipped ${file} (already exists)`);
        }
      }
    }
  }
  await Promise.all(tasks);
}

// Optimize SVG files
async function optimizeSvg(inputPath, outputPath) {
  try {
    const data = await fs.readFile(inputPath, "utf8");
    const result = await svgo.optimize(data, {
      path: inputPath,
      multipass: true,
      plugins: [
        { name: "preset-default" },
        { name: "removeViewBox", active: false },
        { name: "removeDimensions", active: true },
      ],
    });
    await fs.writeFile(outputPath, result.data);
  } catch (err) {
    console.error(`❌ Error optimizing SVG ${path.basename(inputPath)}:`, err.message);
    await fs.copyFile(inputPath, outputPath); // fallback
    console.log(`Copied SVG ${path.basename(inputPath)}`);
  }
}

// Optimize Images
async function optimizeImages() {
  const imageInputDir = path.join(srcDir, "assets/images");
  const imageOutputDir = path.join(publicDir, "assets/images");
  await processImagesRecursive(imageInputDir, imageOutputDir);
}

// Optimize Icons
async function optimizeIcons() {
  const iconInputDir = path.join(srcDir, "assets/icons");
  const iconOutputDir = path.join(publicDir, "assets/icons");
  await processImagesRecursive(iconInputDir, iconOutputDir);
}

// Copy Fonts
async function copyFonts() {
  const fontsSrc = path.join(srcDir, "assets/fonts");
  const fontsDest = path.join(publicDir, "assets/fonts");
  await ensureDir(fontsDest);

  try {
    const files = await fs.readdir(fontsSrc);
    const tasks = files.map(async (file) => {
      const srcPath = path.join(fontsSrc, file);
      const destPath = path.join(fontsDest, file);
      if (!(await fileExists(destPath))) {
        await fs.copyFile(srcPath, destPath);
        console.log(`✅ Copied font: ${file}`);
      } else {
        console.log(`⏩ Skipped font ${file} (already exists)`);
      }
    });
    await Promise.all(tasks);
  } catch (err) {
    console.error(`❌ Error copying fonts:`, err.message);
    throw err;
  }
}

// Process Videos (MP4 compression with skip if exists)
async function processVideos() {
  const videoSrcDir = path.join(srcDir, "assets/videos");
  const videoOutDir = path.join(publicDir, "assets/videos");
  await ensureDir(videoOutDir);

  const files = await fs.readdir(videoSrcDir);
  const tasks = [];

  for (const file of files) {
    const inputPath = path.join(videoSrcDir, file);
    const outputPath = path.join(videoOutDir, file);
    const ext = path.extname(file).toLowerCase();

    if (await fileExists(outputPath)) {
      console.log(`⏩ Skipped video ${file} (already exists)`);
      continue;
    }

    if (ext === ".mp4") {
      tasks.push(
        new Promise((resolve) => {
          ffmpeg(inputPath)
            .outputOptions(["-c:v libx264", "-crf 28", "-preset", "fast"])
            .save(outputPath)
            .on("end", () => {
              console.log(`✅ Saved MP4: ${file}`);
              resolve();
            })
            .on("error", (err) => {
              console.error(`❌ Error processing video ${file}:`, err.message);
              fs.copyFile(inputPath, outputPath).then(() => {
                console.log(`Copied video ${file} due to processing error`);
                resolve();
              });
            });
        })
      );
    } else {
      await fs.copyFile(inputPath, outputPath);
      console.log(`✅ Copied video ${file}`);
    }
  }
  await Promise.all(tasks);
}

// Minify HTML
async function minifyHtml() {
  const htmlSrcDir = srcDir;
  const htmlOutDir = publicDir;
  await ensureDir(htmlOutDir);

  const files = await fs.readdir(htmlSrcDir);
  const tasks = [];

  for (const file of files) {
    if (path.extname(file).toLowerCase() === ".html") {
      const inputPath = path.join(htmlSrcDir, file);
      const outputPath = path.join(htmlOutDir, file);

      if (await fileExists(outputPath)) {
        console.log(`⏩ Skipped HTML ${file} (already exists)`);
        continue;
      }

      tasks.push(
        (async () => {
          try {
            const html = await fs.readFile(inputPath, "utf8");
            const minified = await htmlMinify(html, {
              collapseWhitespace: true,
              removeComments: true,
              minifyCSS: true,
              minifyJS: true,
              removeEmptyAttributes: true,
            });
            await fs.writeFile(outputPath, minified);
            console.log(`✅ Minified HTML: ${file}`);
          } catch (err) {
            console.error(`❌ Error minifying HTML ${file}:`, err.message);
            await fs.copyFile(inputPath, outputPath);
            console.log(`Copied HTML ${file} due to minification error`);
          }
        })()
      );
    }
  }
  await Promise.all(tasks);
}

// Minify JS
async function minifyJs() {
  const jsSrcDir = path.join(srcDir, "assets/js");
  const jsOutDir = path.join(publicDir, "assets/js");
  await ensureDir(jsOutDir);

  const files = await fs.readdir(jsSrcDir);
  const tasks = [];

  for (const file of files) {
    if (path.extname(file).toLowerCase() === ".js") {
      const inputPath = path.join(jsSrcDir, file);
      const outputPath = path.join(jsOutDir, file);

      if (await fileExists(outputPath)) {
        console.log(`⏩ Skipped JS ${file} (already exists)`);
        continue;
      }

      tasks.push(
        (async () => {
          try {
            const code = await fs.readFile(inputPath, "utf8");
            const minified = await jsMinify(code, {
              compress: true,
              mangle: true,
              sourceMap: false,
            });
            await fs.writeFile(outputPath, minified.code);
            console.log(`✅ Minified JS: ${file}`);
          } catch (err) {
            console.error(`❌ Error minifying JS ${file}:`, err.message);
            await fs.copyFile(inputPath, outputPath);
            console.log(`Copied JS ${file} due to minification error`);
          }
        })()
      );
    }
  }
  await Promise.all(tasks);
}

// Main Build Function
async function build() {
  console.log("🚀 Starting build process...");

  try {
    await Promise.all([
      processVideos().then(() => console.log("✅ Videos processed")),
      copyFonts().then(() => console.log("✅ Fonts copied")),
      optimizeIcons().then(() => console.log("✅ Icons optimized")),
      optimizeImages().then(() => console.log("✅ Images optimized")),
      minifyHtml().then(() => console.log("✅ HTML minified")),
      minifyJs().then(() => console.log("✅ JS minified")),
    ]);
    console.log("🎉 Build completed successfully!");
  } catch (err) {
    console.error("❌ Build failed:", err);
    process.exit(1);
  }
}

build();

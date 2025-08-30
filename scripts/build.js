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
    console.log(`✅ Created directory: ${dir}`);
  } catch (err) {
    if (err.code !== "EEXIST") {
      console.error(`❌ Failed to create directory ${dir}:`, err.message);
      throw err;
    }
  }
}

// Process images recursively (optimized PNG, JPEG, WebP, AVIF)
async function processImagesRecursive(inputDir, outputDir) {
  await ensureDir(outputDir);
  console.log(`Processing directory: ${outputDir}`);
  const files = await fs.readdir(inputDir);
  const tasks = [];

  for (const file of files) {
    const inputPath = path.normalize(path.join(inputDir, file));
    const outputPath = path.normalize(path.join(outputDir, file));
    const stat = await fs.stat(inputPath);

    if (stat.isDirectory()) {
      tasks.push(processImagesRecursive(inputPath, outputPath));
    } else {
      const ext = path.extname(file).toLowerCase();
      const baseName = path.basename(file, ext);

      if ([".jpg", ".jpeg", ".png"].includes(ext)) {
        tasks.push(
          (async () => {
            try {
              console.log(`Processing file: ${inputPath} -> ${outputPath}`);
              const metadata = await sharp(inputPath).metadata();
              // console.log(`Input file metadata for ${file}:`, metadata);
              const sharpInstance = sharp(inputPath, { failOn: "none" });
              const processingTasks = [];
              const origStat = await fs.stat(inputPath);

              // Original format
              if (ext === ".png") {
                processingTasks.push(
                  sharpInstance.clone().png({ quality: 80, compressionLevel: 9 }).toFile(outputPath)
                    .catch(err => { throw new Error(`Failed to write PNG ${outputPath}: ${err.message}`); })
                );
              } else {
                processingTasks.push(
                  sharpInstance.clone().jpeg({ quality: 75, mozjpeg: true }).toFile(outputPath)
                    .catch(err => { throw new Error(`Failed to write JPEG ${outputPath}: ${err.message}`); })
                );
              }

              // WebP with iterative quality reduction
              const webpPath = path.normalize(path.join(outputDir, `${baseName}.webp`));
              let webpQuality = 70;
              processingTasks.push(
                (async () => {
                  let webpStat;
                  do {
                    await sharpInstance.clone().webp({ quality: webpQuality, effort: 5 }).toFile(webpPath)
                      .catch(err => { throw new Error(`Failed to write WebP ${webpPath}: ${err.message}`); });
                    webpStat = await fs.stat(webpPath);
                    if (webpStat.size >= origStat.size && webpQuality > 20) {
                      console.warn(`⚠️ WebP ${file} (${webpStat.size} bytes) larger than original (${origStat.size} bytes), retrying with quality ${webpQuality - 10}`);
                      webpQuality -= 10;
                    } else if (webpStat.size >= origStat.size) {
                      console.error(`❌ WebP ${file} still larger than original at minimum quality`);
                      await fs.unlink(webpPath).catch(() => {}); // Remove failed WebP
                      throw new Error(`Failed to compress WebP ${file}`);
                    }
                  } while (webpStat.size >= origStat.size && webpQuality > 20);
                  console.log(`✅ WebP ${file} compressed to ${webpStat.size} bytes (original: ${origStat.size} bytes)`);
                })()
              );

              // AVIF with iterative quality reduction
              const avifPath = path.normalize(path.join(outputDir, `${baseName}.avif`));
              let avifQuality = 45;
              processingTasks.push(
                (async () => {
                  let avifStat;
                  do {
                    await sharpInstance.clone().avif({ quality: avifQuality, effort: 5 }).toFile(avifPath)
                      .catch(err => { throw new Error(`Failed to write AVIF ${avifPath}: ${err.message}`); });
                    avifStat = await fs.stat(avifPath);
                    if (avifStat.size >= origStat.size && avifQuality > 20) {
                      console.warn(`⚠️ AVIF ${file} (${avifStat.size} bytes) larger than original (${origStat.size} bytes), retrying with quality ${avifQuality - 10}`);
                      avifQuality -= 10;
                    } else if (avifStat.size >= origStat.size) {
                      console.error(`❌ AVIF ${file} still larger than original at minimum quality`);
                      await fs.unlink(avifPath).catch(() => {}); // Remove failed AVIF
                      throw new Error(`Failed to compress AVIF ${file}`);
                    }
                  } while (avifStat.size >= origStat.size && avifQuality > 20);
                  console.log(`✅ AVIF ${file} compressed to ${avifStat.size} bytes (original: ${origStat.size} bytes)`);
                })()
              );

              await Promise.all(processingTasks);
              console.log(`✅ Processed ${file} (Original, WebP, AVIF)`);
            } catch (err) {
              console.error(`❌ Error processing ${file}:`, err.message);
            }
          })()
        );
      } else if (ext === ".svg") {
        tasks.push(
          optimizeSvg(inputPath, outputPath).then(() =>
            console.log(`✅ Processed SVG ${file}`)
          )
        );
      } else {
        await fs.copyFile(inputPath, outputPath);
        console.log(`✅ Copied ${file}`);
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
    throw err; // Do not copy on error
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
      await fs.copyFile(srcPath, destPath);
      console.log(`✅ Copied font: ${file}`);
    });
    await Promise.all(tasks);
  } catch (err) {
    console.error(`❌ Error copying fonts:`, err.message);
    throw err;
  }
}

// Process Videos
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
              throw err; // Do not copy on error
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
            throw err; // Do not copy on error
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
            throw err; // Do not copy on error
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
      // processVideos().then(() => console.log("✅ Videos processed")),
      // copyFonts().then(() => console.log("✅ Fonts copied")),
      // optimizeIcons().then(() => console.log("✅ Icons optimized")),
      // optimizeImages().then(() => console.log("✅ Images optimized")),
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
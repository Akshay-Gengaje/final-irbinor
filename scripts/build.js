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

          if (ext === ".png") {
            processingTasks.push(
              sharpInstance
                .clone()
                .png({ quality: 90, compressionLevel: 9 })
                .toFile(outputPath)
            );
          } else {
            processingTasks.push(
              sharpInstance
                .clone()
                .jpeg({ quality: 80, mozjpeg: true })
                .toFile(outputPath)
            );
          }

          const webpPath = path.join(outputDir, `${baseName}.webp`);
          processingTasks.push(
            sharpInstance
              .clone()
              .webp({ quality: 80, nearLossless: true })
              .toFile(webpPath)
          );

          const avifPath = path.join(outputDir, `${baseName}.avif`);
          processingTasks.push(
            sharpInstance
              .clone()
              .avif({ quality: 65, effort: 4 })
              .toFile(avifPath)
          );

          tasks.push(
            Promise.all(processingTasks).then(() =>
              console.log(`Processed ${file} → Optimized Original, WebP, AVIF`)
            )
          );
        } catch (err) {
          console.error(`❌ Error processing ${file}:`, err.message);
        }
      } else if (ext === ".svg") {
        tasks.push(
          optimizeSvg(inputPath, outputPath).then(() =>
            console.log(`Processed SVG ${file}`)
          )
        );
      } else {
        await fs.copyFile(inputPath, outputPath);
        console.log(`Copied ${file}`);
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
    await fs.copyFile(inputPath, outputPath); // Fallback to copying
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
    const tasks = files.map((file) =>
      fs.copyFile(path.join(fontsSrc, file), path.join(fontsDest, file))
    );
    await Promise.all(tasks);
    console.log("Fonts copied successfully!");
  } catch (err) {
    console.error(`❌ Error copying fonts:`, err.message);
    throw err;
  }
}

// Process Videos (MP4 compression with fallback)
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
              console.log(`Saved MP4: ${file}`);
              resolve();
            })
            .on("error", (err) => {
              console.error(`❌ Error processing video ${file}:`, err.message);
              fs.copyFile(inputPath, outputPath, (copyErr) => {
                if (copyErr) {
                  console.error(`❌ Error copying video ${file}:`, copyErr.message);
                } else {
                  console.log(`Copied video ${file} due to processing error`);
                }
                resolve(); // Continue build even if video processing fails
              });
            });
        })
      );
    } else {
      await fs.copyFile(inputPath, outputPath);
      console.log(`Copied video ${file}`);
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
            console.log(`Minified HTML: ${file}`);
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
            console.log(`Minified JS: ${file}`);
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
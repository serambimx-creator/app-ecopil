const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const INPUT_DIR = path.join(__dirname, '..', 'public', 'impacto');
const OUTPUT_DIR = path.join(INPUT_DIR, 'optimized');
const MAX_WIDTH = 800;
const QUALITY = 80;

async function optimize() {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const files = fs.readdirSync(INPUT_DIR).filter(f =>
        /\.(jpg|jpeg|png|gif)$/i.test(f)
    );

    console.log(`Found ${files.length} images to optimize.\n`);

    for (const file of files) {
        const inputPath = path.join(INPUT_DIR, file);
        const outputName = file.replace(/\.[^.]+$/, '.webp');
        const outputPath = path.join(OUTPUT_DIR, outputName);

        const originalSize = fs.statSync(inputPath).size;

        await sharp(inputPath)
            .resize({ width: MAX_WIDTH, withoutEnlargement: true })
            .webp({ quality: QUALITY })
            .toFile(outputPath);

        const newSize = fs.statSync(outputPath).size;
        const savings = ((1 - newSize / originalSize) * 100).toFixed(1);

        console.log(`${file}`);
        console.log(`  ${(originalSize / 1024).toFixed(0)} KB -> ${(newSize / 1024).toFixed(0)} KB (${savings}% smaller)\n`);
    }

    console.log('Done. Optimized images saved to /public/impacto/optimized/');
}

optimize().catch(console.error);

const https = require('https');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const RAW_DIR = path.join(__dirname, '..', 'public', 'guia');
const OPT_DIR = path.join(RAW_DIR, 'optimized');

const IMAGES = [
  { name: 'tula', wikiFile: 'Telamones_Tula.jpg' },
  { name: 'xoxafi', wikiFile: 'Cascada Grutas de Tolantongo, Hidalgo.jpg' },
  { name: 'tezontepec', wikiFile: 'Shop ceiling Tezontepec boots 2025.jpg' },
  { name: 'mineral-del-chico', wikiFile: 'Vista del parque nacional El Chico.png' },
  { name: 'acaxochitlan', wikiFile: 'Cascadas Chimalapa, Acaxochitlan Hgo.jpg' },
  { name: 'ajolote', wikiFile: 'Axolotl_ganz.jpg' },
];

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
  'Referer': 'https://www.google.com/',
};

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: HEADERS }, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Invalid JSON')); }
      });
    }).on('error', reject);
  });
}

async function getThumbUrl(wikiFile) {
  const encoded = encodeURIComponent(wikiFile);
  const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=File:${encoded}&prop=imageinfo&iiprop=url&iiurlwidth=1280&format=json`;
  const json = await fetchJson(apiUrl);
  const pages = json.query.pages;
  for (const k in pages) {
    if (pages[k].imageinfo && pages[k].imageinfo[0]) {
      return pages[k].imageinfo[0].thumburl || pages[k].imageinfo[0].url;
    }
  }
  throw new Error('Image not found on Wikimedia');
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const doGet = (u) => {
      https.get(u, { headers: HEADERS }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          if (fs.existsSync(dest)) fs.unlinkSync(dest);
          const newFile = fs.createWriteStream(dest);
          return doGet(res.headers.location);
        }
        if (res.statusCode !== 200) {
          file.close();
          if (fs.existsSync(dest)) fs.unlinkSync(dest);
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
      }).on('error', (err) => {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        reject(err);
      });
    };
    doGet(url);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  if (!fs.existsSync(OPT_DIR)) fs.mkdirSync(OPT_DIR, { recursive: true });

  for (let i = 0; i < IMAGES.length; i++) {
    const img = IMAGES[i];
    const rawPath = path.join(RAW_DIR, `${img.name}.jpg`);
    const optPath = path.join(OPT_DIR, `${img.name}.webp`);

    try {
      console.log(`[${i + 1}/6] Resolving ${img.wikiFile}...`);
      const thumbUrl = await getThumbUrl(img.wikiFile);
      console.log(`  URL: ${thumbUrl}`);

      await download(thumbUrl, rawPath);
      const rawSize = fs.statSync(rawPath).size;

      await sharp(rawPath)
        .resize({ width: 800, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(optPath);
      const optSize = fs.statSync(optPath).size;

      console.log(`  OK: ${img.name}.jpg (${Math.round(rawSize / 1024)}KB) -> ${img.name}.webp (${Math.round(optSize / 1024)}KB)`);
    } catch (err) {
      console.log(`  FAIL: ${img.name} - ${err.message}`);
    }

    if (i < IMAGES.length - 1) await sleep(2000);
  }
}

main();

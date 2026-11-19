/**
 * Build the small image atlas used by the first-load film intro.
 *
 * Only verified project photographs are taken from reference/originals/kitchens
 * (plus any extra project photos added there in the future). The detail shots
 * are the matching p01–p09 close-ups from public/images/textures. Room renders,
 * search results and milling samples are deliberately excluded.
 */
import sharp from 'sharp';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const projectOriginals = path.join(root, 'reference/originals/kitchens');
const publicProjects = path.join(root, 'public/images/kitchens');
const detailPhotos = path.join(root, 'public/images/textures');
const outputDir = path.join(root, 'public/images/loading');
const manifestPath = path.join(root, 'src/data/project-atlas.json');
const atlasPath = path.join(outputDir, 'project-atlas.webp');

const tileWidth = 160;
const tileHeight = 120;
const extensions = new Set(['.avif', '.jpg', '.jpeg', '.png', '.webp']);

function filesIn(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory)
    .filter((name) => extensions.has(path.extname(name).toLowerCase()))
    .filter((name) => !/@2x\./i.test(name))
    .map((name) => path.join(directory, name))
    .filter((file) => statSync(file).isFile())
    .sort((a, b) => path.basename(a).localeCompare(path.basename(b), 'en'));
}

const originals = filesIn(projectOriginals);
const originalNames = new Set(
  originals.map((file) => path.parse(file).name.toLowerCase()),
);
const websitePhotos = filesIn(publicProjects).filter(
  (file) => !originalNames.has(path.parse(file).name.toLowerCase()),
);
const projects = [...originals, ...websitePhotos];
const details = filesIn(detailPhotos).filter((file) => /^p\d{2}-.+$/i.test(path.parse(file).name));
const photos = [...projects, ...details];

if (photos.length === 0) {
  throw new Error('No verified project or detail photos were found for the loader atlas.');
}

const columns = Math.min(8, Math.max(4, Math.ceil(Math.sqrt(photos.length))));
const rows = Math.ceil(photos.length / columns);
const composites = await Promise.all(
  photos.map(async (file, index) => ({
    input: await sharp(file)
      .rotate()
      .resize(tileWidth, tileHeight, {
        fit: 'cover',
        position: 'attention',
      })
      .webp({ quality: 64, effort: 5 })
      .toBuffer(),
    left: (index % columns) * tileWidth,
    top: Math.floor(index / columns) * tileHeight,
  })),
);

mkdirSync(outputDir, { recursive: true });
await sharp({
  create: {
    width: columns * tileWidth,
    height: rows * tileHeight,
    channels: 3,
    background: '#211b16',
  },
})
  .composite(composites)
  .webp({ quality: 74, effort: 6, smartSubsample: true })
  .toFile(atlasPath);

const manifest = {
  columns,
  rows,
  count: photos.length,
  projectCount: projects.length,
  detailCount: details.length,
  tileWidth,
  tileHeight,
};
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const sizeKb = Math.round(statSync(atlasPath).size / 1024);
console.log(
  `Loader atlas: ${projects.length} project photos + ${details.length} detail photos ` +
    `(${photos.length} frames, ${sizeKb} KB)`,
);

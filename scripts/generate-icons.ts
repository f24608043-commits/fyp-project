import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.join(process.cwd(), 'public', 'favicon.svg');
const publicDir = path.join(process.cwd(), 'public');

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];

async function generateIcons() {
  const svgBuffer = fs.readFileSync(svgPath);

  for (const { name, size } of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(publicDir, name));
    console.log(`Generated ${name}`);
  }

  // Generate favicon.ico (multi-size: 16x16, 32x32)
  const favicon16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
  const favicon32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  
  // For favicon.ico, we'll use a simple approach - just use the 32x32 as PNG for now
  // A true .ico requires a specific format, but browsers accept PNG favicons
  await sharp(svgBuffer).resize(32, 32).png().toFile(path.join(publicDir, 'favicon.ico'));
  console.log('Generated favicon.ico');

  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);

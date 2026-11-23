import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generateFavicons() {
  const svgPath = path.resolve('app/icon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  // Generate PNG buffers for 16, 32, 48
  const sizes = [16, 32, 48];
  const pngBuffers = await Promise.all(
    sizes.map((size) =>
      sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toBuffer()
    )
  );

  // Generate apple-touch-icon (180x180) and icon-192, icon-512 for PWA
  const appleTouch = await sharp(svgBuffer).resize(180, 180).png().toBuffer();
  fs.writeFileSync(path.resolve('public/apple-touch-icon.png'), appleTouch);

  const icon192 = await sharp(svgBuffer).resize(192, 192).png().toBuffer();
  fs.writeFileSync(path.resolve('public/icon-192.png'), icon192);

  const icon512 = await sharp(svgBuffer).resize(512, 512).png().toBuffer();
  fs.writeFileSync(path.resolve('public/icon-512.png'), icon512);

  // Construct standard ICO buffer with 16, 32, 48
  const count = sizes.length;
  const headerSize = 6 + count * 16;
  let currentOffset = headerSize;

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // icon type
  header.writeUInt16LE(count, 4); // count of images

  const entries = [];
  for (let i = 0; i < count; i++) {
    const size = sizes[i];
    const buf = pngBuffers[i];
    const entry = Buffer.alloc(16);

    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // palette count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(buf.length, 8); // image size
    entry.writeUInt32LE(currentOffset, 12); // image offset

    currentOffset += buf.length;
    entries.push(entry);
  }

  const icoBuffer = Buffer.concat([header, ...entries, ...pngBuffers]);

  // Write to both app/favicon.ico and public/favicon.ico
  fs.writeFileSync(path.resolve('app/favicon.ico'), icoBuffer);
  fs.writeFileSync(path.resolve('public/favicon.ico'), icoBuffer);

  console.log('Successfully generated SilverSuite favicon.ico (16, 32, 48) and icons!');
}

generateFavicons().catch((err) => {
  console.error(err);
  process.exit(1);
});

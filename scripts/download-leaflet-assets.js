const https = require('https');
const fs = require('fs');
const path = require('path');

const assets = [
  {
    url: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    filename: 'marker-icon.png'
  },
  {
    url: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    filename: 'marker-icon-2x.png'
  },
  {
    url: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    filename: 'marker-shadow.png'
  }
];

const publicDir = path.join(__dirname, '..', 'public', 'images');

// Create the directory if it doesn't exist
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

assets.forEach(asset => {
  const file = fs.createWriteStream(path.join(publicDir, asset.filename));
  https.get(asset.url, response => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${asset.filename}`);
    });
  }).on('error', err => {
    fs.unlink(path.join(publicDir, asset.filename));
    console.error(`Error downloading ${asset.filename}:`, err.message);
  });
}); 
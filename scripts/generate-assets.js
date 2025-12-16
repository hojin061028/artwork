const fs = require('fs');
const path = require('path');

const worksDir = path.join(__dirname, '../public/assets/works');
const artworkDir = path.join(__dirname, '../public/assets/artwork');
const output = path.join(__dirname, '../public/assets.json');

function getFiles(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter(file => !file.startsWith('.'));
}

const images = getFiles(worksDir).filter(f => /\.(png|jpg|jpeg|gif|webp)$/i.test(f));
const videos = getFiles(worksDir).filter(f => /\.(mp4|webm|mov)$/i.test(f));
const artworks = getFiles(artworkDir).filter(f => /\.(png|jpg|jpeg|gif|webp)$/i.test(f));

const data = {
    images,
    videos,
    artworks
};

fs.writeFileSync(output, JSON.stringify(data, null, 2));
console.log('Generated public/assets.json');

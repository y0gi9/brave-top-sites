// Script to download 4K wallpapers locally for instant loading
const fs = require('fs');
const https = require('https');
const path = require('path');

const wallpaperUrls = [
    'https://w.wallhaven.cc/full/ex/wallhaven-ex6ko1.jpg',
    'https://w.wallhaven.cc/full/72/wallhaven-72k6wy.jpg',
    'https://w.wallhaven.cc/full/ym/wallhaven-ymxqjw.jpg',
    'https://w.wallhaven.cc/full/6k/wallhaven-6k3oox.jpg',
    'https://w.wallhaven.cc/full/xl/wallhaven-xl83dp.jpg',
    'https://w.wallhaven.cc/full/we/wallhaven-we3l8y.jpg',
    'https://w.wallhaven.cc/full/kx/wallhaven-kx37xl.jpg',
    'https://w.wallhaven.cc/full/z8/wallhaven-z8dg9y.jpg',
    'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=3840&h=2160',
    'https://images.pexels.com/photos/1226302/pexels-photo-1226302.jpeg?auto=compress&cs=tinysrgb&w=3840&h=2160',
    'https://images.pexels.com/photos/1366957/pexels-photo-1366957.jpeg?auto=compress&cs=tinysrgb&w=3840&h=2160',
    'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=3840&h=2160',
    'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=3840&h=2160',
    'https://images.pexels.com/photos/1421903/pexels-photo-1421903.jpeg?auto=compress&cs=tinysrgb&w=3840&h=2160',
    'https://images.pexels.com/photos/1525041/pexels-photo-1525041.jpeg?auto=compress&cs=tinysrgb&w=3840&h=2160',
    'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=3840&h=2160'
];

const wallpapersDir = path.join(__dirname, 'wallpapers');

// Create wallpapers directory if it doesn't exist
if (!fs.existsSync(wallpapersDir)) {
    fs.mkdirSync(wallpapersDir);
}

function downloadImage(url, index) {
    return new Promise((resolve, reject) => {
        const fileName = `wallpaper-${index + 1}.jpg`;
        const filePath = path.join(wallpapersDir, fileName);
        
        console.log(`Downloading wallpaper ${index + 1}/${wallpaperUrls.length}: ${fileName}`);
        
        const file = fs.createWriteStream(filePath);
        
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode} for ${url}`));
                return;
            }
            
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                console.log(`✓ Downloaded: ${fileName}`);
                resolve(fileName);
            });
            
            file.on('error', (err) => {
                fs.unlink(filePath, () => {});
                reject(err);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function downloadAllWallpapers() {
    console.log('Starting wallpaper download...\n');
    
    const downloadedFiles = [];
    
    for (let i = 0; i < wallpaperUrls.length; i++) {
        try {
            const fileName = await downloadImage(wallpaperUrls[i], i);
            downloadedFiles.push(fileName);
        } catch (error) {
            console.error(`✗ Failed to download wallpaper ${i + 1}: ${error.message}`);
        }
    }
    
    console.log(`\n✓ Download complete! Downloaded ${downloadedFiles.length}/${wallpaperUrls.length} wallpapers`);
    console.log('Wallpapers saved in:', wallpapersDir);
    
    // Update the wallpaper list in the main script
    const wallpaperList = downloadedFiles.map(file => `'wallpapers/${file}'`).join(',\n        ');
    
    console.log('\nAdd this to your newtab.js wallpapers array:');
    console.log('const wallpapers = [');
    console.log('        ' + wallpaperList);
    console.log('    ];');
}

downloadAllWallpapers().catch(console.error);
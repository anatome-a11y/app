const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'node_modules', 'metro', 'src', 'blacklist.js');
const source = path.join(__dirname, 'metro-blacklist.js');

if (fs.existsSync(target) && fs.existsSync(source)) {
    fs.copyFileSync(source, target);
}

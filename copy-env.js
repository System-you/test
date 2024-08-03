const fs = require('fs');

const source = '.env.example';
const destination = '.env';

fs.copyFileSync(source, destination);
console.log(`${source} was copied to ${destination}`);
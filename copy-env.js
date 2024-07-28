const fs = require('fs');

const source = '.env.example';
const destination = '.env';

// if (!fs.existsSync(destination)) {
//     fs.copyFileSync(source, destination);
//     console.log(`${source} was copied to ${destination}`);
// } else {
//     console.log(`${destination} already exists. Skipping copy.`);
// }

fs.copyFileSync(source, destination);
console.log(`${source} was copied to ${destination}`);
const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes("\\${'https://skyo-backend.onrender.com'}")) {
        console.log(`Fixing URLs in: ${fullPath}`);
        // Replace all instances of `\${'https://skyo-backend.onrender.com'}` with `${'https://skyo-backend.onrender.com'}`
        content = content.replace(/\\\$\{'https:\/\/skyo-backend\.onrender\.com'\}/g, "${'https://skyo-backend.onrender.com'}");
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

const frontendSrcDir = path.join(__dirname, 'frontend/src');
console.log(`Starting URL fix in: ${frontendSrcDir}`);
processDirectory(frontendSrcDir);
console.log('Finished!');

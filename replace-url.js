const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('process.env.NEXT_PUBLIC_API_URL')) {
        content = content.replace(/\process\.env\.NEXT_PUBLIC_API_URL \|\| 'http:\/\/localhost:3000'/g, "'https://skyo-backend.onrender.com'");
        content = content.replace(/process\.env\.NEXT_PUBLIC_API_URL/g, "'https://skyo-backend.onrender.com'");
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

replaceInDir(path.join(__dirname, 'frontend/src'));

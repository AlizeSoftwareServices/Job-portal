const https = require('https');

https.get('https://skyoconsultancy.vercel.app/empadmin', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // extract all script src
    const regex = /<script[^>]+src="([^"]+)"/g;
    let match;
    let scripts = [];
    while ((match = regex.exec(data)) !== null) {
      scripts.push(match[1]);
    }
    
    console.log(`Found ${scripts.length} scripts. Checking them...`);
    
    let pending = scripts.length;
    let foundRender = false;
    let foundLocalhost = false;
    
    if (pending === 0) console.log("No scripts found!");
    
    scripts.forEach(src => {
      let url = src.startsWith('http') ? src : `https://skyoconsultancy.vercel.app${src.startsWith('/') ? src : '/' + src}`;
      https.get(url, (sRes) => {
        let sData = '';
        sRes.on('data', chunk => sData += chunk);
        sRes.on('end', () => {
          if (sData.includes('skyo-backend.onrender.com')) {
            console.log(`FOUND skyo-backend.onrender.com in ${url}`);
            foundRender = true;
          }
          if (sData.includes('localhost:3000')) {
            console.log(`FOUND localhost:3000 in ${url}`);
            foundLocalhost = true;
          }
          pending--;
          if (pending === 0) {
            console.log(`Render found: ${foundRender}, Localhost found: ${foundLocalhost}`);
          }
        });
      }).on('error', err => {
        console.error(`Failed to fetch ${url}`);
        pending--;
      });
    });
  });
}).on('error', err => console.error(err));

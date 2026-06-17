const https = require('https');

https.get('https://skyoconsultancy.vercel.app/signup', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (data.includes('skyo-backend.onrender.com')) {
      console.log('FOUND skyo-backend.onrender.com in the HTML!');
    } else if (data.includes('localhost:3000')) {
      console.log('FOUND localhost:3000 in the HTML!');
    } else {
      console.log('Could not find either URL in the raw HTML.');
    }
  });
}).on('error', err => console.error(err));

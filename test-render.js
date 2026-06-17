const https = require('https');

const req = https.get('https://skyo-backend.onrender.com/admin/stats', (res) => {
  console.log('STATUS:', res.statusCode);
  console.log('HEADERS:', res.headers);

  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('BODY:', data.substring(0, 200));
  });
});

req.on('error', err => console.error('ERROR:', err.message));
req.setTimeout(15000, () => {
  console.log('TIMEOUT! Render is hanging.');
  req.destroy();
});

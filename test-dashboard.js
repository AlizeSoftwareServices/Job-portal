const https = require('https');

https.get('https://skyo-backend.onrender.com/admin/dashboard-data', (res) => {
  console.log('STATUS:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('BODY:', data));
}).on('error', err => console.log(err));

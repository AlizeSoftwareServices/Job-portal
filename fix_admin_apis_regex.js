const fs = require('fs');
let c = fs.readFileSync('frontend/src/app/admin/page.tsx', 'utf8');

c = c.replace(/const res = await fetch\(`\$\{API_URL\}\/categories\/upload-image`, \{\s*method: 'POST',\s*body: formData/g,
  `const res = await fetch(\`\${API_URL}/categories/upload-image\`, {\n        method: 'POST',\n        headers: { Authorization: \`Bearer \${localStorage.getItem('skyo_admin_token')}\` },\n        body: formData`);

c = c.replace(/const res = await fetch\(`\$\{API_URL\}\/categories\/\$\{id\}`\, \{\s*method: 'DELETE'\s*\}\);/g,
  `const res = await fetch(\`\${API_URL}/categories/\${id}\`, {\n        method: 'DELETE',\n        headers: { Authorization: \`Bearer \${localStorage.getItem('skyo_admin_token')}\` }\n      });`);

c = c.replace(/const res = await fetch\(`\$\{API_URL\}\/jobs\/\$\{id\}`\, \{\s*method: 'DELETE'\s*\}\);/g,
  `const res = await fetch(\`\${API_URL}/jobs/\${id}\`, {\n        method: 'DELETE',\n        headers: { Authorization: \`Bearer \${localStorage.getItem('skyo_admin_token')}\` }\n      });`);

c = c.replace(/const res = await fetch\(`\$\{API_URL\}\/admin\/applications\/\$\{appId\}\/assign-employer\/\$\{employerId\}`\, \{\s*method: 'GET'\s*\}\);/g,
  `const res = await fetch(\`\${API_URL}/admin/applications/\${appId}/assign-employer/\${employerId}\`, {\n        method: 'POST',\n        headers: { Authorization: \`Bearer \${localStorage.getItem('skyo_admin_token')}\` }\n      });`);

fs.writeFileSync('frontend/src/app/admin/page.tsx', c);

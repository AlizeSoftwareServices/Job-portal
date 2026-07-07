const fs = require('fs');
let c = fs.readFileSync('frontend/src/app/employer/dashboard/page.tsx', 'utf8');

// robust replacement for fetchDirectApps
c = c.replace(
  /const fetchDirectApps[\s\S]*?setDirectApps\(data\);\n\s*\} catch\(err\)/,
  `const fetchDirectApps = async (empId: string) => {
    try {
      const token = localStorage.getItem('skyo_token');
      const res = await fetch(\`\${API_URL}/applications\`, { headers: { Authorization: \`Bearer \${token}\` } });
      const data = await res.json();
      if(Array.isArray(data)) setDirectApps(data.filter((a: any) => a.job?.recruitmentPosition === 'DIRECT'));
    } catch(err)`
);

// robust replacement for fetchSkyoApps
c = c.replace(
  /const fetchSkyoApps[\s\S]*?setSkyoApps\(data\);\n\s*\} catch\(err\)/,
  `const fetchSkyoApps = async (empId: string) => {
    try {
      const token = localStorage.getItem('skyo_token');
      const res = await fetch(\`\${API_URL}/applications\`, { headers: { Authorization: \`Bearer \${token}\` } });
      const data = await res.json();
      if(Array.isArray(data)) setSkyoApps(data.filter((a: any) => a.job?.recruitmentPosition === 'SKYO_CONSULTANCY'));
    } catch(err)`
);

fs.writeFileSync('frontend/src/app/employer/dashboard/page.tsx', c);
console.log('Fixed fetchDirectApps and fetchSkyoApps');

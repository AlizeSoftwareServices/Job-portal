const fs = require('fs');
let c = fs.readFileSync('frontend/src/app/employer/dashboard/page.tsx', 'utf8');

c = c.replace(/const fetchDirectApps = async \(empId: string\) => {[\s\S]*?};\n\n  const fetchSkyoApps = async \(empId: string\) => {[\s\S]*?};/,
`const fetchDirectApps = async (empId: string) => {
    try {
      const token = localStorage.getItem('skyo_token');
      const res = await fetch(\`\${API_URL}/applications\`, { headers: { Authorization: \`Bearer \${token}\` } });
      const data = await res.json();
      if(Array.isArray(data)) setDirectApps(data.filter((a: any) => a.job?.recruitmentPosition === 'DIRECT'));
    } catch(err) { console.error(err); }
  };

  const fetchSkyoApps = async (empId: string) => {
    try {
      const token = localStorage.getItem('skyo_token');
      const res = await fetch(\`\${API_URL}/applications\`, { headers: { Authorization: \`Bearer \${token}\` } });
      const data = await res.json();
      if(Array.isArray(data)) setSkyoApps(data.filter((a: any) => a.job?.recruitmentPosition === 'SKYO_CONSULTANCY'));
    } catch(err) { console.error(err); }
  };`);

// And for the POST job request:
c = c.replace(
  "const res = await fetch(`${API_URL}/jobs`, {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },",
  "const token = localStorage.getItem('skyo_token');\n      const res = await fetch(`${API_URL}/jobs`, {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },"
);
// wait, the post job replacement might fail due to \r\n, let's use regex
c = c.replace(/const res = await fetch\(`\$\{API_URL\}\/jobs`, \{\s*method: 'POST',\s*headers: \{ 'Content-Type': 'application\/json' \},/,
"const token = localStorage.getItem('skyo_token');\n      const res = await fetch(`${API_URL}/jobs`, {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },");

fs.writeFileSync('frontend/src/app/employer/dashboard/page.tsx', c);

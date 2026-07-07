const fs = require('fs');
let c = fs.readFileSync('frontend/src/app/employer/dashboard/page.tsx', 'utf8');

const fetchJobsTarget = "const res = await fetch(`${API_URL}/jobs/employer/${empId}`);";
c = c.replace(fetchJobsTarget, "const res = await fetch(`${API_URL}/jobs?employerId=${empId}`);");

const fetchDirectTarget = `  const fetchDirectApps = async (empId: string) => {
    try {
      const res = await fetch(\`\${API_URL}/applications/employer/\${empId}/direct\`);
      const data = await res.json();
      setDirectApps(data);
    } catch(err) { console.error(err); }
  };`;
const fetchDirectReplace = `  const fetchDirectApps = async (empId: string) => {
    try {
      const token = localStorage.getItem('skyo_token');
      const res = await fetch(\`\${API_URL}/applications\`, { headers: { Authorization: \`Bearer \${token}\` } });
      const data = await res.json();
      if(Array.isArray(data)) setDirectApps(data.filter((a: any) => a.job?.recruitmentPosition === 'DIRECT'));
    } catch(err) { console.error(err); }
  };`;
c = c.replace(fetchDirectTarget, fetchDirectReplace);

const fetchSkyoTarget = `  const fetchSkyoApps = async (empId: string) => {
    try {
      const res = await fetch(\`\${API_URL}/applications/employer/\${empId}/skyo\`);
      const data = await res.json();
      setSkyoApps(data);
    } catch(err) { console.error(err); }
  };`;
const fetchSkyoReplace = `  const fetchSkyoApps = async (empId: string) => {
    try {
      const token = localStorage.getItem('skyo_token');
      const res = await fetch(\`\${API_URL}/applications\`, { headers: { Authorization: \`Bearer \${token}\` } });
      const data = await res.json();
      if(Array.isArray(data)) setSkyoApps(data.filter((a: any) => a.job?.recruitmentPosition === 'SKYO_CONSULTANCY'));
    } catch(err) { console.error(err); }
  };`;
c = c.replace(fetchSkyoTarget, fetchSkyoReplace);

const postJobTarget = `      const res = await fetch(\`\${API_URL}/jobs\`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },`;
const postJobReplace = `      const res = await fetch(\`\${API_URL}/jobs\`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`
        },`;
c = c.replace(postJobTarget, postJobReplace);

// I noticed the previous script failed on postJobTarget because the actual text in the file was:
// headers: { 'Content-Type': 'application/json' },
// Wait, looking at the previous diff block, the file had:
// const res = await fetch(`${API_URL}/jobs`, {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
// Let's use string indexOf and replace instead to be very safe.

c = c.replace(
  "const res = await fetch(`${API_URL}/jobs`, {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },",
  "const token = localStorage.getItem('skyo_token');\n      const res = await fetch(`${API_URL}/jobs`, {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },"
);

c = c.replace(
  "const res = await fetch(`${API_URL}/jobs/${jobId}/request-closure`, { method: 'PUT' });",
  "const token = localStorage.getItem('skyo_token');\n      const res = await fetch(`${API_URL}/jobs/${jobId}/request-closure`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });"
);

c = c.replace(
  "const res = await fetch(`${API_URL}/jobs/${jobId}/repost`, { method: 'PUT' });",
  "const token = localStorage.getItem('skyo_token');\n      const res = await fetch(`${API_URL}/jobs/${jobId}/repost`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });"
);

fs.writeFileSync('frontend/src/app/employer/dashboard/page.tsx', c);
console.log('Fixed employer dashboard');

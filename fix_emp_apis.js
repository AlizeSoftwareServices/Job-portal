const fs = require('fs');
let c = fs.readFileSync('frontend/src/app/employer/dashboard/page.tsx', 'utf8');

c = c.replace(
  "const res = await fetch(`${API_URL}/jobs/employer/${empId}`);",
  "const res = await fetch(`${API_URL}/jobs?employerId=${empId}`);" // Note: jobs GET doesn't strictly need auth to fetch active ones, but it has employerId param
);

c = c.replace(
  "const fetchDirectApps = async (empId: string) => {\n    try {\n      const res = await fetch(`${API_URL}/applications/employer/${empId}/direct`);\n      const data = await res.json();\n      setDirectApps(data);\n    } catch(err) { console.error(err); }\n  };\n\n  const fetchSkyoApps = async (empId: string) => {\n    try {\n      const res = await fetch(`${API_URL}/applications/employer/${empId}/skyo`);\n      const data = await res.json();\n      setSkyoApps(data);\n    } catch(err) { console.error(err); }\n  };",
  "const fetchDirectApps = async (empId: string) => {\n    try {\n      const token = localStorage.getItem('skyo_token');\n      const res = await fetch(`${API_URL}/applications`, { headers: { Authorization: `Bearer ${token}` } });\n      const data = await res.json();\n      if(Array.isArray(data)) setDirectApps(data.filter((a: any) => a.job?.recruitmentPosition === 'DIRECT'));\n    } catch(err) { console.error(err); }\n  };\n\n  const fetchSkyoApps = async (empId: string) => {\n    try {\n      const token = localStorage.getItem('skyo_token');\n      const res = await fetch(`${API_URL}/applications`, { headers: { Authorization: `Bearer ${token}` } });\n      const data = await res.json();\n      if(Array.isArray(data)) setSkyoApps(data.filter((a: any) => a.job?.recruitmentPosition === 'SKYO_CONSULTANCY'));\n    } catch(err) { console.error(err); }\n  };"
);

// Fix POST/PUT requests in Employer dashboard
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

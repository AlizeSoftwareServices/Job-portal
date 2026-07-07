const fs = require('fs');
let c = fs.readFileSync('frontend/src/app/employer/dashboard/page.tsx', 'utf8');

const t1 = `  const fetchDirectApps = async (empId: string) => {\r\n    try {\r\n      const res = await fetch(\`\${API_URL}/applications/employer/\${empId}/direct\`);\r\n      const data = await res.json();\r\n      setDirectApps(data);\r\n    } catch(err) { console.error(err); }\r\n  };`;
const t1LF = `  const fetchDirectApps = async (empId: string) => {\n    try {\n      const res = await fetch(\`\${API_URL}/applications/employer/\${empId}/direct\`);\n      const data = await res.json();\n      setDirectApps(data);\n    } catch(err) { console.error(err); }\n  };`;

const r1 = `  const fetchDirectApps = async (empId: string) => {\n    try {\n      const token = localStorage.getItem('skyo_token');\n      const res = await fetch(\`\${API_URL}/applications\`, { headers: { Authorization: \`Bearer \${token}\` } });\n      const data = await res.json();\n      if(Array.isArray(data)) setDirectApps(data.filter((a: any) => a.job?.recruitmentPosition === 'DIRECT'));\n    } catch(err) { console.error(err); }\n  };`;

if (c.includes(t1)) { c = c.replace(t1, r1); }
else if (c.includes(t1LF)) { c = c.replace(t1LF, r1); }

const t2 = `  const fetchSkyoApps = async (empId: string) => {\r\n    try {\r\n      const res = await fetch(\`\${API_URL}/applications/employer/\${empId}/skyo\`);\r\n      const data = await res.json();\r\n      setSkyoApps(data);\r\n    } catch(err) { console.error(err); }\r\n  };`;
const t2LF = `  const fetchSkyoApps = async (empId: string) => {\n    try {\n      const res = await fetch(\`\${API_URL}/applications/employer/\${empId}/skyo\`);\n      const data = await res.json();\n      setSkyoApps(data);\n    } catch(err) { console.error(err); }\n  };`;

const r2 = `  const fetchSkyoApps = async (empId: string) => {\n    try {\n      const token = localStorage.getItem('skyo_token');\n      const res = await fetch(\`\${API_URL}/applications\`, { headers: { Authorization: \`Bearer \${token}\` } });\n      const data = await res.json();\n      if(Array.isArray(data)) setSkyoApps(data.filter((a: any) => a.job?.recruitmentPosition === 'SKYO_CONSULTANCY'));\n    } catch(err) { console.error(err); }\n  };`;

if (c.includes(t2)) { c = c.replace(t2, r2); }
else if (c.includes(t2LF)) { c = c.replace(t2LF, r2); }

fs.writeFileSync('frontend/src/app/employer/dashboard/page.tsx', c);

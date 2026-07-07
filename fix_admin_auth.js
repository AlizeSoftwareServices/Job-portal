const fs = require('fs');

let content = fs.readFileSync('frontend/src/app/admin/page.tsx', 'utf8');

// Replace handleAdminLogin
const newLogin = `  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUsername, password: adminPassword })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('skyo_admin_token', data.token);
        localStorage.setItem('skyo_admin_auth', 'true');
        setIsAdminAuthenticated(true);
        window.location.reload();
      } else {
        alert('Invalid username or password');
      }
    } catch (err) {
      alert('Login failed');
    }
  };`;

content = content.replace(
  /const handleAdminLogin = \(e: React\.FormEvent\) => \{[\s\S]*?alert\('Invalid username or password'\);\s*\}\s*\};/,
  newLogin
);

// Replace handleAdminLogout
content = content.replace(
  /localStorage\.removeItem\('skyo_admin_auth'\);/,
  `localStorage.removeItem('skyo_admin_auth');\n    localStorage.removeItem('skyo_admin_token');`
);

// Replace fetchJobs
content = content.replace(
  /const fetchJobs = async \(\) => \{[\s\S]*?const res = await fetch\(`\$\{API_URL\}\/jobs\/admin-all`\);/,
  `const fetchJobs = async () => {\n    try {\n      const res = await fetch(\`\${API_URL}/jobs/admin-all\`, { headers: { Authorization: \`Bearer \${localStorage.getItem('skyo_admin_token')}\` } });`
);

// Replace fetchApplications
content = content.replace(
  /const fetchApplications = async \(\) => \{[\s\S]*?const res = await fetch\(`\$\{API_URL\}\/applications`\);/,
  `const fetchApplications = async () => {\n    try {\n      const res = await fetch(\`\${API_URL}/applications\`, { headers: { Authorization: \`Bearer \${localStorage.getItem('skyo_admin_token')}\` } });`
);

// Replace fetchCategories
content = content.replace(
  /const fetchCategories = async \(\) => \{[\s\S]*?const res = await fetch\(`\$\{API_URL\}\/categories`\);/,
  `const fetchCategories = async () => {\n    try {\n      const res = await fetch(\`\${API_URL}/categories\`, { headers: { Authorization: \`Bearer \${localStorage.getItem('skyo_admin_token')}\` } });`
);

// Replace fetchEmployersList
content = content.replace(
  /const fetchEmployersList = async \(\) => \{[\s\S]*?const res = await fetch\(`\$\{API_URL\}\/admin\/employers`\);/,
  `const fetchEmployersList = async () => {\n    try {\n      const res = await fetch(\`\${API_URL}/admin/employers\`, { headers: { Authorization: \`Bearer \${localStorage.getItem('skyo_admin_token')}\` } });`
);

// Replace fetchStats
content = content.replace(
  /const fetchStats = async \(\) => \{[\s\S]*?const res = await fetch\(`\$\{API_URL\}\/admin\/dashboard-data`\);/,
  `const fetchStats = async () => {\n    try {\n      const res = await fetch(\`\${API_URL}/admin/dashboard-data\`, { headers: { Authorization: \`Bearer \${localStorage.getItem('skyo_admin_token')}\` } });`
);

fs.writeFileSync('frontend/src/app/admin/page.tsx', content, 'utf8');
console.log('Successfully updated admin page fetch logic');

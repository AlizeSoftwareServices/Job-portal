const fs = require('fs');
let c = fs.readFileSync('frontend/src/app/admin/page.tsx', 'utf8');

const t1 = `headers: { 'Content-Type': 'application/json' },`;
const r1 = `headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${localStorage.getItem('skyo_admin_token')}\` },`;
// Replace all 8 occurrences of this (since they all need the admin token)
c = c.split(t1).join(r1);

// Handle the upload image POST (has no headers currently)
const t2 = `const res = await fetch(\`\${API_URL}/categories/upload-image\`, {
        method: 'POST',
        body: formData`;
const r2 = `const res = await fetch(\`\${API_URL}/categories/upload-image\`, {
        method: 'POST',
        headers: { Authorization: \`Bearer \${localStorage.getItem('skyo_admin_token')}\` },
        body: formData`;
c = c.split(t2).join(r2);

// Handle approve closure PUT
const t3 = `const res = await fetch(\`\${API_URL}/jobs/\${id}/approve-closure\`, { method: 'PUT' });`;
const r3 = `const res = await fetch(\`\${API_URL}/jobs/\${id}/approve-closure\`, { method: 'PUT', headers: { Authorization: \`Bearer \${localStorage.getItem('skyo_admin_token')}\` } });`;
c = c.split(t3).join(r3);

// Handle delete category
const t4 = `const res = await fetch(\`\${API_URL}/categories/\${id}\`, {
        method: 'DELETE'
      });`;
const r4 = `const res = await fetch(\`\${API_URL}/categories/\${id}\`, {
        method: 'DELETE',
        headers: { Authorization: \`Bearer \${localStorage.getItem('skyo_admin_token')}\` }
      });`;
c = c.split(t4).join(r4);

// Handle assign employer
const t5 = `const res = await fetch(\`\${API_URL}/admin/applications/\${appId}/assign-employer/\${employerId}\`, {
        method: 'GET'
      });`;
// wait, the backend route I created is POST! I should fix method: 'POST'
const r5 = `const res = await fetch(\`\${API_URL}/admin/applications/\${appId}/assign-employer/\${employerId}\`, {
        method: 'POST',
        headers: { Authorization: \`Bearer \${localStorage.getItem('skyo_admin_token')}\` }
      });`;
c = c.split(t5).join(r5);

// Handle application review PATCH
const t6 = `await fetch(\`\${API_URL}/applications/\${appId}/review\`, { method: 'PATCH' });`;
const r6 = `await fetch(\`\${API_URL}/applications/\${appId}/review\`, { method: 'PATCH', headers: { Authorization: \`Bearer \${localStorage.getItem('skyo_admin_token')}\` } });`;
c = c.split(t6).join(r6);

// Handle delete job?
const t7 = `const res = await fetch(\`\${API_URL}/jobs/\${id}\`, {
        method: 'DELETE'
      });`;
const r7 = `const res = await fetch(\`\${API_URL}/jobs/\${id}\`, {
        method: 'DELETE',
        headers: { Authorization: \`Bearer \${localStorage.getItem('skyo_admin_token')}\` }
      });`;
if (c.includes(t7)) {
  c = c.split(t7).join(r7);
}

fs.writeFileSync('frontend/src/app/admin/page.tsx', c);
console.log('Fixed admin dashboard accurately');

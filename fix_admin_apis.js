const fs = require('fs');
let c = fs.readFileSync('frontend/src/app/admin/page.tsx', 'utf8');

function injectAuthHeader(match, beforeBrace) {
  // If headers already exists, inject Authorization into it
  if (match.includes('headers: {')) {
    if (match.includes('Authorization')) return match; // Already has auth
    return match.replace(/headers:\s*\{/, "headers: {\n          'Authorization': `Bearer ${localStorage.getItem('skyo_admin_token')}`,");
  } else {
    // If no headers, add headers property
    return match.replace(/\{/, "{\n        headers: { 'Authorization': `Bearer ${localStorage.getItem('skyo_admin_token')}` },");
  }
}

// target fetch blocks using a regex
const fetchRegex = /fetch\([^,]+,\s*\{[\s\S]*?\}/g;

c = c.replace(fetchRegex, (match) => {
  // skip login and already authorized routes
  if (match.includes('/api/admin/login')) return match;
  if (match.includes('skyo_admin_token')) return match; 
  
  return injectAuthHeader(match);
});

// There are two one-liner fetches without the opening brace configuration that might be missed by the multiline regex:
// 485:      const res = await fetch(`${API_URL}/jobs/${id}/approve-closure`, { method: 'PUT' });
// 573:      await fetch(`${API_URL}/applications/${appId}/review`, { method: 'PATCH' });
c = c.replace(
  "fetch(`${API_URL}/jobs/${id}/approve-closure`, { method: 'PUT' })",
  "fetch(`${API_URL}/jobs/${id}/approve-closure`, { method: 'PUT', headers: { Authorization: `Bearer ${localStorage.getItem('skyo_admin_token')}` } })"
);
c = c.replace(
  "fetch(`${API_URL}/applications/${appId}/review`, { method: 'PATCH' })",
  "fetch(`${API_URL}/applications/${appId}/review`, { method: 'PATCH', headers: { Authorization: `Bearer ${localStorage.getItem('skyo_admin_token')}` } })"
);

fs.writeFileSync('frontend/src/app/admin/page.tsx', c);
console.log('Fixed admin dashboard');

const fs = require('fs');
let content = fs.readFileSync('frontend/src/app/admin/page.tsx', 'utf8');

const target = `  useEffect(() => {
    if (localStorage.getItem('skyo_admin_auth') === 'true') {
      setIsAdminAuthenticated(true);
    }
    setAdminAuthChecked(true);
    Promise.all([fetchJobs(), fetchApplications(), fetchCategories(), fetchEmployersList(), fetchStats()]).then(() => setLoading(false));
  }, []);`;

const replacement = `  useEffect(() => {
    const token = localStorage.getItem('skyo_admin_token');
    if (localStorage.getItem('skyo_admin_auth') === 'true' && token) {
      setIsAdminAuthenticated(true);
      Promise.all([fetchJobs(), fetchApplications(), fetchCategories(), fetchEmployersList(), fetchStats()]).then(() => setLoading(false));
    } else {
      localStorage.removeItem('skyo_admin_auth');
      localStorage.removeItem('skyo_admin_token');
      setIsAdminAuthenticated(false);
      setLoading(false);
    }
    setAdminAuthChecked(true);
  }, []);`;

content = content.replace(target, replacement);

fs.writeFileSync('frontend/src/app/admin/page.tsx', content, 'utf8');
console.log('Fixed useEffect in admin page');

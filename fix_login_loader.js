const fs = require('fs');
let c = fs.readFileSync('frontend/src/app/login/page.tsx', 'utf8');

if (!c.includes('<style>{`')) {
  // Inject the style tag at the beginning of the return statement
  const target = '<div className="min-h-screen bg-zinc-50 font-sans flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">';
  const replacement = `<style>{\`
        @keyframes loadingBarSlide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-loading-bar {
          animation: loadingBarSlide 1.5s infinite linear;
        }
      \`}</style>
      <div className="min-h-screen bg-zinc-50 font-sans flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
        {loading && (
          <div className="fixed top-0 left-0 w-full h-1.5 bg-green-100 z-50 overflow-hidden">
            <div className="h-full w-full bg-green-500 animate-loading-bar rounded-r-full shadow-[0_0_10px_#22c55e]"></div>
          </div>
        )}`;
  c = c.replace(target, replacement);
  fs.writeFileSync('frontend/src/app/login/page.tsx', c);
  console.log('Added loading bar to login page');
}

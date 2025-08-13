// Debug utility for production troubleshooting
export const logEnvironmentInfo = () => {
  console.log('=== Environment Debug Info ===');
  console.log('User Agent:', navigator.userAgent);
  console.log('URL:', window.location.href);
  console.log('Protocol:', window.location.protocol);
  console.log('Host:', window.location.host);
  console.log('Pathname:', window.location.pathname);
  console.log('Is Production:', import.meta.env.PROD);
  console.log('Mode:', import.meta.env.MODE);
  console.log('Base URL:', import.meta.env.BASE_URL);
  console.log('Document Ready State:', document.readyState);
  console.log('Root Element:', document.getElementById('root'));
  console.log('=== End Debug Info ===');
};

// Call this in main.tsx for production debugging
if (import.meta.env.PROD) {
  logEnvironmentInfo();
}

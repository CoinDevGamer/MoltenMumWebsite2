export function getRoute(){ return (location.hash.replace('#','') || '/'); }
export function navigate(to){ location.hash = to; }
window.addEventListener('hashchange', ()=>{ /* React side listens via state setter */ });

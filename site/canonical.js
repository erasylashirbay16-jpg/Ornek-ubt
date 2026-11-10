/* Örnek has one public address; preserve path, query and hash on old aliases. */
(()=>{const host='ornek-ubt.vercel.app';if(location.hostname.endsWith('.vercel.app')&&location.hostname!==host)location.replace('https://'+host+location.pathname+location.search+location.hash)})();

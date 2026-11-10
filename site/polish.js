const iconPaths=['M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9','M5 4h14v17H5zM8 2v4m8-4v4M8 10h8m-8 4h8m-8 4h5','M4 20V10m6 10V4m6 16v-7m5 7H2','M6 3h12v18l-6-4-6 4z','M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z','m13 2-9 12h7l-1 8 10-13h-7z','m12 3 9 9-9 9-9-9z','M12 8v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0','M16 3h-3c-3 0-3 3-3 6v9c0 3-2 3-4 3M6 10h11','M9 9a3 3 0 0 1 6 0c0 2-3 2-3 5m0 3v.1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0'];
document.querySelectorAll('aside nav button').forEach((b,i)=>{const span=b.querySelector('span');if(span)span.outerHTML=`<svg class="navicon" viewBox="0 0 24 24" aria-hidden="true"><path d="${iconPaths[i]}"></path></svg>`});
// Keep focus and the current view clear after moving between screens.
const baseNavigate=navigate;navigate=function(el,fn){baseNavigate(el,fn);const heading=app.querySelector('h1');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true})}};
const baseChoose=choose;choose=function(i){baseChoose(i);document.querySelectorAll('.option').forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)))};
const baseSubmitPolish=submit;submit=function(){baseSubmitPolish();if(run?.checked)document.querySelectorAll('.option').forEach(b=>b.disabled=true)};
const baseSectionPolish=section;section=function(i){baseSectionPolish(i);window.scrollTo(0,0)};
const baseRenderPolish=renderQ;renderQ=function(){baseRenderPolish();document.querySelectorAll('.option').forEach(b=>b.setAttribute('aria-pressed','false'));window.scrollTo(0,0)};
const navHome=document.querySelector('aside nav button');navHome.classList.add('active');

/* Presentation only: stored questions, answer values and scoring remain untouched. */
(()=>{
'use strict';
const NS='http://www.w3.org/1998/Math/MathML';
function el(tag,...children){const n=document.createElementNS(NS,tag);for(const c of children)n.append(typeof c==='string'?document.createTextNode(c):c);return n}
function parse(source){
 const tokens=source.match(/sqrt|[A-Za-zΑ-ωӘәҒғҚқҢңӨөҰұҮүҺһІі]|\d+(?:[.,]\d+)?|[²³⁰¹⁴⁵⁶⁷⁸⁹]|[^\s]/gu)||[];let i=0;
 function atom(){const t=tokens[i++];if(!t)throw Error();if(t==='('||t==='{'){const n=sum();if(tokens[i++]!==(t==='('?')':'}'))throw Error();return t==='('?el('mrow',el('mo','('),n,el('mo',')')):n}if(t==='√'||t==='sqrt')return el('msqrt',power());if(t==='-'||t==='−'||t==='+')return el('mrow',el('mo',t),atom());if(/^\d/.test(t))return el('mn',t);if(/^[A-Za-zΑ-ωӘәҒғҚқҢңӨөҰұҮүҺһІі]$/u.test(t))return el('mi',t);throw Error()}
 function power(){let n=atom();while(i<tokens.length){const t=tokens[i];if(t==='^'||t==='_'){i++;n=el(t==='^'?'msup':'msub',n,power())}else if(/^[²³⁰¹⁴⁵⁶⁷⁸⁹]$/.test(t)){i++;n=el('msup',n,el('mn',String('⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(t))))}else break}return n}
 function product(){let n=power();while(i<tokens.length){const t=tokens[i];if(['/','÷','*','×','·'].includes(t)){i++;const r=power();n=(t==='/'||t==='÷')?el('mfrac',n,r):el('mrow',n,el('mo','·'),r)}else if(/^(?:[A-Za-zΑ-ω]|\d|\(|√|sqrt)/u.test(t)){n=el('mrow',n,power())}else break}return n}
 function sum(){let n=product();while(['+','-','−','=','≠','≤','≥','<','>','≈'].includes(tokens[i])){const op=tokens[i++];n=el('mrow',n,el('mo',op),product())}return n}
 const result=sum();if(i!==tokens.length)throw Error();return result;
}
// Restrict automatic recognition to mathematical atoms, never ordinary words or URLs.
const atom='(?:sqrt|[A-Za-zΑ-ω]|\\d+(?:[.,]\\d+)?|[²³⁰¹⁴⁵⁶⁷⁸⁹]|[(){}√])';
const expression=new RegExp('(?<![\\p{L}\\p{N}:/])'+atom+'(?:\\s*(?:[+−=≠≤≥<>≈*/÷×·^_–-]\\s*)?'+atom+')*(?![\\p{L}\\p{N}:])','gu');
function convert(node){const text=node.nodeValue;if(!/[\^_√²³⁰¹⁴⁵⁶⁷⁸⁹*/÷×·]|sqrt/.test(text))return;expression.lastIndex=0;let match,last=0,changed=false;const out=document.createDocumentFragment();while((match=expression.exec(text))){const value=match[0].trimEnd();if(!/[\^_√²³⁰¹⁴⁵⁶⁷⁸⁹*/÷×·]|sqrt/.test(value)||value.length>400)continue;try{const math=el('math',parse(value));math.classList.add('ornek-formula');math.setAttribute('aria-label',value);out.append(text.slice(last,match.index),math);last=match.index+value.length;changed=true}catch{/* Ambiguous prose stays readable as authored. */}}if(changed){out.append(text.slice(last));node.replaceWith(out)}}
function render(root){if(root.nodeType===3){if(!root.parentElement?.closest('math,script,style,textarea,input,code,pre,[contenteditable="true"],.logo,nav'))convert(root);return}if(root.nodeType!==1||root.closest('math,script,style,textarea,input,code,pre,[contenteditable="true"]'))return;const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];while(walk.nextNode())nodes.push(walk.currentNode);nodes.forEach(render)}
window.ornekMath={parse,render};
const observer=new MutationObserver(records=>{observer.disconnect();for(const r of records){if(r.type==='characterData')render(r.target);else r.addedNodes.forEach(render)}observe()});
function observe(){observer.observe(document.body,{subtree:true,childList:true,characterData:true})}
render(document.getElementById('app')||document.body);observe();
})();

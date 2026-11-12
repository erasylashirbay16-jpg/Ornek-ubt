/* Presentation only: stored questions, answer values and scoring remain untouched. */
(()=>{
'use strict';
const NS='http://www.w3.org/1998/Math/MathML';
function el(tag,...children){const n=document.createElementNS(NS,tag);for(const c of children)n.append(typeof c==='string'?document.createTextNode(c):c);return n}
function parse(source){
 source=source.replace(/\*\*/g,'^').replace(/!=/g,'≠').replace(/<=/g,'≤').replace(/>=/g,'≥');
 const tokens=source.match(/sqrt|cbrt|sin|cos|tan|cot|log|ln|[A-Za-zΑ-ωӘәҒғҚқҢңӨөҰұҮүҺһІі]|\d+(?:[.,]\d+)?|[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+|[₀₁₂₃₄₅₆₇₈₉₊₋]+|[^\s]/gu)||[];let i=0;
 function atom(){const t=tokens[i++];if(!t)throw Error();if(t==='('||t==='{'){const n=sum();if(tokens[i++]!==(t==='('?')':'}'))throw Error();return t==='('?el('mrow',el('mo','('),n,el('mo',')')):n}if(t==='√'||t==='sqrt')return el('msqrt',power());if(t==='∛'||t==='cbrt')return el('mroot',power(),el('mn','3'));if(t==='∜')return el('mroot',power(),el('mn','4'));if(/^(sin|cos|tan|cot|log|ln)$/.test(t)){const n=el('mi',t);n.setAttribute('mathvariant','normal');return n}if(t==='∞'||t==='π')return el('mi',t);if(t==='-'||t==='−'||t==='+')return el('mrow',el('mo',t),atom());if(/^\d/.test(t))return el('mn',t);if(/^[A-Za-zΑ-ωӘәҒғҚқҢңӨөҰұҮүҺһІі]$/u.test(t))return el('mi',t);throw Error()}
 function power(){let n=atom();while(i<tokens.length){const t=tokens[i];if(t==='^'||t==='_'){i++;n=el(t==='^'?'msup':'msub',n,power())}else if(/^[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+$/.test(t)||/^[₀₁₂₃₄₅₆₇₈₉₊₋]+$/.test(t)){i++;const sub=/^[₀₁₂₃₄₅₆₇₈₉₊₋]/.test(t);const chars=sub?'₀₁₂₃₄₅₆₇₈₉₊₋':'⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻';const value=[...t].map(c=>'0123456789+−'[chars.indexOf(c)]).join('');n=el(sub?'msub':'msup',n,el('mn',value))}else break}return n}
 function product(){let n=power();while(i<tokens.length){const t=tokens[i];if(['/','÷','*','×','·'].includes(t)){i++;const r=power();n=(t==='/'||t==='÷')?el('mfrac',n,r):el('mrow',n,el('mo','·'),r)}else if(/^(?:[A-Za-zΑ-ω]|\d|\(|√|∛|∜|sqrt|cbrt|∞)/u.test(t)){n=el('mrow',n,power())}else break}return n}
 function sum(){let n=product();while(['+','-','−','=','≠','≤','≥','<','>','≈'].includes(tokens[i])){const op=tokens[i++];n=el('mrow',n,el('mo',op),product())}return n}
 const result=sum();if(i!==tokens.length)throw Error();return result;
}
// Restrict automatic recognition to mathematical atoms, never ordinary words or URLs.
const atom='(?:sqrt|cbrt|sin|cos|tan|cot|log|ln|[A-Za-zΑ-ω]|\\d+(?:[.,]\\d+)?|[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻₀₁₂₃₄₅₆₇₈₉₊₋]|[(){}√∛∜∞])';
const expression=new RegExp('(?<![\\p{L}\\p{N}:/])'+atom+'(?:\\s*(?:(?:\\*\\*|!=|<=|>=|[+−=≠≤≥<>≈*/÷×·^_–-])\\s*)?'+atom+')*(?![\\p{L}\\p{N}:])','gu');
function convert(node){const text=node.nodeValue;if(!/[\^_√∛∜⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻₀₁₂₃₄₅₆₇₈₉₊₋*/÷×·]|sqrt|cbrt|(?:sin|cos|tan|cot|log|ln)\(/.test(text))return;const urls=[...text.matchAll(/(?:https?:\/\/|www\.)\S+/g)].map(m=>[m.index,m.index+m[0].length]);
 // A score such as "1 / 10" is a count, not an algebraic fraction.
 // Keep counters inline, while questions and their mathematical notation still use MathML.
 const inMetric=!!node.parentElement?.closest('.stats,.hero,.learning-summary,.goal-number,.testtile,.testresult,.subject-banner,.reading-top,.reading-q-label,.reading-passage-meta,.draftbanner,.testfilter,.review.row,.study-rail,.qhero');
expression.lastIndex=0;let match,last=0,changed=false;const out=document.createDocumentFragment();while((match=expression.exec(text))){if(urls.some(([a,b])=>match.index<b&&match.index+match[0].length>a))continue;const value=match[0].trimEnd();if(!/[\^_√∛∜⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻₀₁₂₃₄₅₆₇₈₉₊₋*/÷×·]|sqrt|cbrt|(?:sin|cos|tan|cot|log|ln)\(/.test(value)||value.length>400)continue;
 if(inMetric&&/^\d+(?:[.,]\d+)?\s*\/\s*\d+(?:[.,]\d+)?$/.test(value))continue;try{const math=el('math',parse(value));math.classList.add('ornek-formula');math.setAttribute('aria-label',value);out.append(text.slice(last,match.index),math);last=match.index+value.length;changed=true}catch{/* Ambiguous prose stays readable as authored. */}}if(changed){out.append(text.slice(last));node.replaceWith(out)}}
function render(root){if(root.nodeType===3){if(!root.parentElement?.closest('math,script,style,textarea,input,code,pre,[contenteditable="true"],.logo,nav'))convert(root);return}if(root.nodeType!==1||root.closest('math,script,style,textarea,input,code,pre,[contenteditable="true"]'))return;const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];while(walk.nextNode())nodes.push(walk.currentNode);nodes.forEach(render)}
window.ornekMath={parse,render};
const observer=new MutationObserver(records=>{observer.disconnect();for(const r of records){if(r.type==='characterData')render(r.target);else r.addedNodes.forEach(render)}observe()});
function observe(){observer.observe(document.body,{subtree:true,childList:true,characterData:true})}
render(document.getElementById('app')||document.body);observe();
})();

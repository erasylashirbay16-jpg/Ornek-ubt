
/* Registered after testVariants, before tests.js */
(() => {
  const lookup = new Map(bank.map(q => [q.t, q.id]));
  let next = Math.max(...testVariants.map(t => t.number))+1;
  for (let v = 0; v < 40; v++) {
    const slice = ornekMath2026Questions.slice(v*10, (v+1)*10);
    const ids = slice.map(q => lookup.get(q.t));
    if(ids.length!==10 || ids.some(id=>!Number.isInteger(id))) throw Error('Missing questions in 2026 variant '+(v+1));
    testVariants.push({number:next++,ids,ornek2026:true});
  }
})();

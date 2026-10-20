const assert=require('node:assert/strict');
const M=require('../app/src/main/assets/model.js');
let s=M.fresh();let steps=0;
function act(id,item='',answer=''){const r=M.act(s,id,item,answer);assert.equal(r.ok,true,`${id}: ${r.text}`);steps++;s=M.restore(JSON.stringify(s));return r;}
function denied(id,item='',answer=''){const before=JSON.stringify(s);assert.equal(M.act(s,id,item,answer).ok,false,id);assert.equal(JSON.stringify(s),before,'failed action must not mutate state');}
denied('shed');denied('manor','gold');denied('clock');act('pot');denied('manor','key');act('shed','key');assert(!s.bag.includes('key'));act('shed');
denied('box');act('letter');const before=JSON.stringify(s);assert.equal(M.act(s,'box','','999').puzzle,'box');assert.equal(JSON.stringify(s),before);act('box','','314');act('handle');act('combine');assert(s.bag.includes('axe'));assert(!s.bag.includes('head'));act('oil');
s.scene='garden';act('green');act('cloth');act('jug');denied('gold');act('flowers');assert.equal(M.act(s,'valve','','111').puzzle,'valve');act('valve','','241');act('valve','jug');act('gold');
s.scene='garden';denied('manor','axe');act('manor','gold');denied('manor','cloth');act('manor','axe');act('manor','oil');act('fountain','cloth');act('fountain');act('bench','tile');assert(!s.bag.includes('tile'));act('manor');
denied('cabinet','axe');act('clock','','725');act('clock');act('cabinet','seal');act('cabinet');act('desk','deed');assert(s.flags.ending);assert.equal(M.current(s)[0],'done');assert.equal(M.tasks.filter(t=>s.flags[t[0]]).length,26);assert.equal(s.stars,26);
for(const id of ['roses','lights','water'])assert(M.renovate(s,id));assert.equal(s.stars,17);assert(!M.renovate(s,'roses'));assert(!M.renovate(s,'bogus'));assert.equal(M.restore(JSON.stringify(s)).renovations.length,3);
assert.deepEqual(M.restore('{broken'),M.fresh());assert.deepEqual(M.restore('null'),M.fresh());assert.deepEqual(M.restore('{"v":5}'),M.fresh());
// Optional order: leave the shed and revisit without losing inventory.
let alt=M.fresh();M.act(alt,'pot');M.act(alt,'shed','key');M.act(alt,'shed');M.act(alt,'letter');alt.scene='garden';M.act(alt,'green');alt.scene='garden';M.act(alt,'shed');assert.equal(alt.scene,'shed');assert(alt.bag.includes('letter'));
console.log(JSON.stringify({passed:true,chapterSteps:26,replayedActions:steps,checks:['full chapter','wrong-item rejection','wrong-code rejection','scene gates','save/load after every action','inventory consumption','axe combination','three renovations','revisit','corrupt save recovery']},null,2));

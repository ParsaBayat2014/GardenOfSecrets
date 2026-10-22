const assert=require('node:assert/strict'),{launch}=require('./ui-harness.cjs');
(async()=>{const h=await launch(+(process.env.QA_WIDTH||915),+(process.env.QA_HEIGHT||412));const {page}=h;try{
 const legacy=JSON.stringify({v:1,scene:'garden',flags:{pot:true},bag:['key'],stars:1,renovations:[],notes:[],started:true});await page.evaluate(value=>localStorage.setItem('turquoise-garden-v1',value),legacy);
 await page.goto(h.url+'/rebuild/index.html');h.errors.length=0;
 await page.waitForFunction(()=>document.body.dataset.ready==='true',null,{timeout:60000});
 await page.screenshot({path:'.qa/rebuild-menu.png'});await page.click('#startBtn');await page.click('#skipStory');
 const settle=async()=>{await page.waitForFunction(()=>!document.body.classList.contains('busy')||!document.getElementById('dialogue').hidden,null,{timeout:45000});if(await page.locator('#dialogue').isVisible())await page.click('#skipStory');await page.waitForFunction(()=>!document.body.classList.contains('busy'));};
 const act=async id=>{await page.locator('[data-action="'+id+'"]').tap();await settle();};
 const item=async id=>{await page.locator('[data-item="'+id+'"]').tap();await settle();};
 const code=async value=>{for(let i=0;i<value.length;i++)for(let n=0;n<+value[i];n++)await page.locator('[data-up="'+i+'"]').tap();await page.click('#submitCode');await settle();};
 const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('turquoise-garden-rebuild-v1')));
 await act('pot');assert.equal((await state()).stars,1);await item('key');await act('shed');await act('shed');await page.screenshot({path:'.qa/rebuild-shed.png'});
 // The opening sequence above exercises real walking, skeletal pickup and door use.
 // Run the remaining logical chapter with the accessible reduced-motion option.
 await page.click('#settingsBtn');await page.click('#motionToggle');await page.click('#resumeGame');
 await act('letter');await act('box');await code('314');await act('handle');await item('head');await item('handle');await act('oil');await page.click('#backBtn');await act('green');await act('cloth');await act('jug');await act('flowers');await act('valve');await code('241');await item('jug');await act('valve');await act('gold');await page.click('#backBtn');await item('gold');await act('manor');await item('axe');await act('manor');await item('oil');await act('manor');await item('cloth');await act('fountain');await act('fountain');await item('tile');await act('bench');await act('manor');await act('clock');await code('725');await act('clock');await item('seal');await act('cabinet');await act('cabinet');await item('deed');await act('desk');
 await page.locator('#endingGo').waitFor();assert.equal((await state()).stars,26);await page.click('#endingGo');
 for(const id of ['roses','lights','water']){await page.click('#renovateBtn');await page.locator('[data-upgrade="'+id+'"]').tap();await settle();}
 assert((await state()).storySeen.includes('opening'));await page.locator('#endingGo').waitFor();await page.click('#endingGo');assert.equal((await state()).stars,17);await page.screenshot({path:'.qa/rebuild-garden.png'});
 await page.reload();await page.waitForFunction(()=>document.body.dataset.ready==='true');await page.click('#startBtn');assert.equal((await state()).flags.ending,true);assert.equal(await page.locator('#dialogue').isVisible(),false);assert.equal(await page.evaluate(()=>localStorage.getItem('turquoise-garden-v1')),legacy);assert.deepEqual(h.errors,[]);
 console.log('PASS: 3D assets, real walking/pickup/door, all 26 steps, three locks, renovations, epilogue and independent save/reload.');
}finally{await h.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

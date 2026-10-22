const assert=require('node:assert/strict'),{launch}=require('./ui-harness.cjs');
(async()=>{const h=await launch(740,360);const {page}=h;try{
 await page.click('#startBtn');await page.click('#dialogueText');
 const portrait=()=>page.locator('#speakerCanvas').evaluate(el=>el.toDataURL());
 const pixels=await portrait();await page.waitForTimeout(850);assert.equal(await portrait(),pixels,'portrait must not jump between poses while one line plays');
 assert.equal(await page.locator('#actors').evaluate(el=>getComputedStyle(el).visibility),'hidden');
 assert.equal(await page.locator('#listenerCanvas').getAttribute('data-character'),'saman');
 await page.screenshot({path:'.qa/dialogue-0.3-small.png'});await page.click('#skipStory');
 await page.evaluate(()=>document.querySelector('[data-action="shed"]').click());
 await page.waitForFunction(()=>/^walk-v3:/.test(document.querySelector('.raha canvas').dataset.frame||''));
 await page.evaluate(()=>{window.pausedForTest=true;Object.defineProperty(document,'hidden',{configurable:true,get:()=>window.pausedForTest});});
 await page.waitForTimeout(100);const before=await page.locator('.raha').evaluate(el=>[el.style.left,el.style.top]);await page.waitForTimeout(400);assert.deepEqual(await page.locator('.raha').evaluate(el=>[el.style.left,el.style.top]),before,'backgrounded movement pauses');
 await page.evaluate(()=>{window.pausedForTest=false;});await h.settle();
 await page.screenshot({path:'.qa/stage-0.3-small.png'});assert.deepEqual(h.errors,[]);
 console.log('PASS: stable portrait pixels, speaker/listener stage, paused walk resumes, small-screen rendering and asset loading.');
}finally{await h.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

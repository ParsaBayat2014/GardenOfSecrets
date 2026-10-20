const assert=require('node:assert/strict');
const {launch}=require('./ui-harness.cjs');
(async()=>{const h=await launch();const {page,state}=h;try{
 await page.locator('#startBtn').tap();
 for(let i=0;i<7;i++){await page.locator('#dialogueText').tap();await page.locator('#nextLine').tap();}
 await page.locator('[data-choice="home"]').tap();assert.equal((await state()).choices.intro,'home');
 await page.evaluate(()=>{document.querySelector('[data-action="pot"]').click();document.getElementById('friendTalk').click();document.getElementById('mapBtn').click();});
 assert.equal(await page.locator('#modal').isVisible(),false);
 await h.settle();assert((await state()).storySeen.includes('pot'));assert.equal((await state()).stars,1);
 await page.reload();await page.locator('#startBtn').tap();await page.waitForFunction(()=>document.getElementById('menu').hidden);assert.equal((await state()).choices.intro,'home');assert.equal(await page.locator('#cinema').isVisible(),false);assert.deepEqual(h.errors,[]);
 console.log('PASS: actual dialogue choice, persistent choice, companion and map blocked during an action, story beat preserved.');
}finally{await h.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

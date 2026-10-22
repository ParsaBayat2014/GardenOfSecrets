const assert=require('node:assert/strict'),path=require('node:path');
const {launch}=require('./ui-harness.cjs');
(async()=>{
 const h=await launch(+(process.env.QA_WIDTH||915),+(process.env.QA_HEIGHT||412));const {page,act,item,code,settle,state,qa}=h;
 try{
  await page.waitForFunction(()=>document.querySelector('.menu-hero'));
  await page.screenshot({path:path.join(qa,'menu-0.3.png')});
  await page.locator('#startBtn').tap();await page.locator('#dialogueText').tap();
  await page.screenshot({path:path.join(qa,'dialogue-0.3.png')});
  await page.locator('#skipStory').tap();
  await page.evaluate(()=>{for(let n=0;n<12;n++)document.querySelector('[data-action="pot"]').click();});
  await page.waitForFunction(()=>/^walk-v3:[0-7]$/.test(document.querySelector('.raha canvas').dataset.frame||''));
  await settle();assert.equal((await state()).stars,1);assert.deepEqual((await state()).bag,['key']);
  await item('key');await act('shed');await act('shed');await act('letter');await act('box');await code('314');await act('handle');await item('head');await item('handle');await act('oil');
  await page.locator('#returnBtn').tap();await act('green');await act('cloth');await act('jug');await act('flowers');await act('valve');await code('241');await item('jug');await act('valve');await act('gold');
  await page.locator('#returnBtn').tap();await item('gold');await act('manor');await item('axe');await act('manor');await item('oil');await act('manor');await item('cloth');await act('fountain');await act('fountain');await item('tile');await act('bench');await act('manor');
  await act('clock');await code('725');await act('clock');await item('seal');await act('cabinet');await act('cabinet');await item('deed');await act('desk');
  await page.locator('#endingGo').waitFor();await page.screenshot({path:path.join(qa,'ending-0.3.png')});await page.locator('#endingGo').tap();
  assert.equal((await state()).flags.ending,true);assert.equal((await state()).stars,26);
  for(const place of ['archive','green','shed','garden']){await page.locator('#mapBtn').tap();await page.locator('[data-place="'+place+'"]').tap();await settle();assert.equal((await state()).scene,place);}
  for(const upgrade of ['roses','lights','water']){await page.locator('#renovateBtn').tap();await page.locator('[data-upgrade="'+upgrade+'"]').tap();await settle();}
  await page.locator('#endingGo').waitFor();assert((await state()).storySeen.includes('opening'));assert.equal((await state()).stars,17);await page.locator('#endingGo').tap();
  await page.screenshot({path:path.join(qa,'garden-0.3.png')});
  const before=await state();await page.reload();await page.locator('#startBtn').tap();await page.waitForFunction(()=>document.getElementById('menu').hidden);assert.equal(await page.locator('#cinema').isVisible(),false);assert.deepEqual((await state()).storySeen,before.storySeen);
  await page.locator('#settingsBtn').tap();await page.locator('#motionToggle').tap();await page.locator('#resumeGame').tap();assert.equal((await state()).motion,false);assert(await page.locator('#game').evaluate(el=>el.classList.contains('reduced-motion')));
  await page.locator('#notesBtn').tap();await page.locator('#journalStory').tap();assert.equal(await page.locator('.character-card').count(),3);await page.locator('[data-replay="green"]').tap();await page.locator('#nextLine').tap();await page.locator('#skipStory').tap();
  await page.locator('#friendTalk').tap();assert(await page.locator('#cinema').isVisible());await page.locator('#skipStory').tap();
  assert.deepEqual(h.errors,[]);console.log('PASS: full animated route, walking frames, 12-click spam, 3 locks, story beats, epilogue, cross-scene travel, save/reload, reduced motion, replay and NPC chat.');
 }finally{await h.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

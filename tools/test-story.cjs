const assert=require('node:assert/strict');
const M=require('../app/src/main/assets/model.js'),S=require('../app/src/main/assets/story.js');
for(const [id,beat] of Object.entries(S.beats)){
 assert(beat.lines.length>=3,id);assert(beat.title);for(const line of beat.lines){assert(S.characters[line.who],id);assert(line.text.length>10,id);assert(S.characters[line.who][line.mood],id);}
 if(beat.choice){assert.equal(beat.choice.options.length,2);assert.notEqual(beat.choice.options[0][0],beat.choice.options[1][0]);}
}
const old={v:1,scene:'shed',flags:{pot:true,shed:true},bag:['letter','axe'],stars:5,renovations:[],notes:[],sound:false,started:true};
const migrated=M.restore(JSON.stringify(old));assert.deepEqual(migrated.storySeen,[]);assert.deepEqual(migrated.choices,{});assert.equal(migrated.motion,true);assert.equal(migrated.sound,false);assert.deepEqual(migrated.bag,old.bag);assert.equal(migrated.scene,'shed');
migrated.storySeen=['intro','green'];migrated.choices={intro:'home',mosaic:'garden'};migrated.motion=false;assert.deepEqual(M.restore(JSON.stringify(migrated)),migrated);
assert.equal(M.travel(migrated,'archive').ok,false);migrated.flags.inner=true;assert.equal(M.travel(migrated,'archive').ok,true);assert.equal(migrated.scene,'archive');migrated.flags.letter=true;assert.equal(M.travel(migrated,'green').ok,true);assert.equal(migrated.scene,'green');
const bad=M.restore(JSON.stringify({...old,choices:{intro:'bad'},storySeen:['<script>',5,null,'intro','intro'],motion:false}));assert.deepEqual(bad.storySeen,['intro']);assert.deepEqual(bad.choices,{});assert.equal(bad.motion,false);
console.log(JSON.stringify({passed:true,characters:Object.keys(S.characters).length,storyScenes:Object.keys(S.beats).length,dialogueLines:Object.values(S.beats).reduce((n,b)=>n+b.lines.length,0),checks:['dialogue references','sprite frame definitions','old-save migration','new-save roundtrip','fast travel','invalid story data filtering']}));

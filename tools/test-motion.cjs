const assert = require('node:assert/strict');
const M = require('../app/src/main/assets/motion.js');
const points = M.route('garden', {x:22,y:70}, 'manor', 77);
assert.deepEqual(points, [{x:22,y:70},{x:22,y:89},{x:77,y:89},{x:77,y:66}]);
for (const scale of [.3, 1, 2]) {
 const path = M.metric(points, scale);
 let previous = -1;
 for(let t=0;t<=1000;t+=10) {
  const distance=M.distanceAt(t,1000,path.total);
  assert(distance>=previous && distance<=path.total);
  const p=M.sample(path,distance);
  assert(Number.isFinite(p.x)&&Number.isFinite(p.y));
  previous=distance;
 }
 assert.equal(M.distanceAt(0,1000,path.total),0);
 assert.equal(M.distanceAt(1000,1000,path.total),path.total);
 const last=M.sample(path,path.total);
 assert.equal(last.x,77); assert.equal(last.y,66);
 assert.equal(last.faceLeft,null,'vertical travel preserves prior facing');
}
assert.equal(M.sample(M.metric([{x:70,y:80},{x:20,y:80}]),50).faceLeft,true);
assert.equal(M.sample(M.metric([{x:20,y:80},{x:70,y:80}]),50).faceLeft,false);
assert.equal(M.sample(M.metric([{x:20,y:80}]),0),null);
assert.equal(M.route('garden',{x:22,y:70},'pot',22,75).at(-1).y,75);
console.log('PASS: foreground routing, floor clamp, monotonic travel, endpoints at three scales, vertical facing and zero-length paths.');

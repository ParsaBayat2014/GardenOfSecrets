/* Authored floor marks and distance-driven locomotion; no per-frame random poses. */
(function(root){'use strict';
const marks={
 garden:{pot:[22,88],shed:[27,63],green:[53,55],manor:[77,66],fountain:[44,88],bench:[83,88]},
 shed:{box:[28,75],handle:[40,79],letter:[57,78],oil:[81,75]},
 green:{cloth:[20,78],jug:[28,78],flowers:[52,77],valve:[79,78],gold:[60,68]},
 archive:{clock:[26,77],desk:[48,79],cabinet:[77,78],portrait:[51,72]}
};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function route(scene,start,id,x,maxY=92){
 const end=(marks[scene]&&marks[scene][id])||[clamp(x,19,83),78];
 const target={x:end[0],y:Math.min(maxY,end[1])},points=[{...start}];
 // Cross the foreground path before approaching props behind the fountain.
 if(scene==='garden'&&Math.abs(start.x-target.x)>24){const y=Math.min(maxY,89);if(Math.abs(start.y-y)>2)points.push({x:start.x,y});points.push({x:target.x,y});}
 if(Math.hypot(points.at(-1).x-target.x,points.at(-1).y-target.y)>.1)points.push(target);
 return points;
}
function metric(points,scale=1){const segments=[];let total=0;for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],length=Math.hypot((b.x-a.x)*15.36*scale,(b.y-a.y)*10.24*scale);segments.push({a,b,length,start:total});total+=length;}return {segments,total};}
function sample(path,distance){const d=clamp(distance,0,path.total),s=path.segments.find(v=>d<=v.start+v.length)||path.segments.at(-1);if(!s)return null;const t=s.length?(d-s.start)/s.length:1;return {x:s.a.x+(s.b.x-s.a.x)*t,y:s.a.y+(s.b.y-s.a.y)*t,faceLeft:Math.abs(s.b.x-s.a.x)<.01?null:s.b.x<s.a.x};}
function distanceAt(time,duration,total){const t=clamp(time/duration,0,1);return total*(t-Math.sin(2*Math.PI*t)/(2*Math.PI));}
const api={route,metric,sample,distanceAt,clamp};if(typeof module!=='undefined')module.exports=api;root.GardenMotion=api;
})(typeof window!=='undefined'?window:globalThis);

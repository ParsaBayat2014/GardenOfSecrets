const step=.5;
export const approaches={garden:{pot:[-4.2,5.7],shed:[-6,-2.25],green:[-7.5,4.5],manor:[3.6,-4.8],fountain:[0,3.35],bench:[5.5,6.2]},shed:{box:[-3,-.7],handle:[-1,-.7],letter:[1,-.7],oil:[3.6,-1.8]},green:{cloth:[-3,1.4],jug:[-1,1.4],flowers:[0,-1.5],valve:[3,-.7],gold:[2,-1.5]},archive:{clock:[-4,-1.5],desk:[0,.5],cabinet:[4,-1.5],portrait:[0,-2.8]}};
export function blocked(scene,x,z){if(scene!=='garden')return Math.abs(x)>5.6||z< -3.8||z>4.5;
 if(Math.abs(x)>9.5||Math.abs(z)>9)return true;
 if(Math.hypot(x,z-.3)<2.65)return true;
 if(x>-.8&&x<8&&z< -5.9)return true;
 if(x> -8.4&&x< -3.7&&z< -3.1)return true;
 if(x< -6&&z> -1.3&&z<3.8)return true;
 return false;
}
export function route(scene,start,end){const snap=v=>Math.round(v/step),key=(x,z)=>x+','+z,from=[snap(start.x),snap(start.z)],to=[snap(end[0]),snap(end[1])];
 const open=[{x:from[0],z:from[1],score:0}],cost=new Map([[key(...from),0]]),parents=new Map();let found=null;
 for(let attempts=0;open.length&&attempts<2400;attempts++){
  open.sort((a,b)=>a.score-b.score);const p=open.shift();if(p.x===to[0]&&p.z===to[1]){found=p;break;}
  for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){const x=p.x+dx,z=p.z+dz;if(blocked(scene,x*step,z*step))continue;if(dx&&dz&&(blocked(scene,(p.x+dx)*step,p.z*step)||blocked(scene,p.x*step,(p.z+dz)*step)))continue;const k=key(x,z),c=cost.get(key(p.x,p.z))+Math.hypot(dx,dz);if(cost.has(k)&&cost.get(k)<=c)continue;cost.set(k,c);parents.set(k,[p.x,p.z]);open.push({x,z,score:c+Math.hypot(x-to[0],z-to[1])});}
 }
 if(!found)return [];
 let p=[found.x,found.z],points=[];while(key(...p)!==key(...from)){points.unshift({x:p[0]*step,z:p[1]*step});p=parents.get(key(...p));if(!p)return [];}
 return points.filter((p,i)=>{if(i===points.length-1)return true;const previous=i?points[i-1]:start,next=points[i+1];return Math.abs((p.x-previous.x)*(next.z-p.z)-(p.z-previous.z)*(next.x-p.x))>1e-5;});
}

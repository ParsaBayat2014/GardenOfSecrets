import * as T from './vendor/three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';

const loader=new GLTFLoader(), palettes={raha:{skin:0xdca477,shirt:0xb64d34,pants:0x285a58,hair:0x30211d,boots:0x633c28},sohrab:{skin:0xc49168,shirt:0x718052,pants:0x72543c,hair:0xe8ddbd,boots:0x4a3024},saman:{skin:0xc99770,shirt:0x477d90,pants:0x9a7a50,hair:0x35251c,boots:0x51372b}};
const sphere=new T.SphereGeometry(1,16,12),materials=new Map();
function material(color){if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color,roughness:.78}));return materials.get(color);}
function oval(parent,color,pos,size){const m=new T.Mesh(sphere,material(color));m.position.set(...pos);m.scale.set(...size);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function tube(parent,color,points,radius){const path=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),mesh=new T.Mesh(new T.TubeGeometry(path,20,radius,6,false),material(color));mesh.castShadow=true;parent.add(mesh);return mesh;}
let clipsPromise;
async function clips(){if(!clipsPromise)clipsPromise=Promise.all(['general','movement'].map(n=>loader.loadAsync('models/'+n+'.glb'))).then(gs=>gs.flatMap(g=>g.animations));return clipsPromise;}

export class Actor {
 static async create(id){const [g,animations]=await Promise.all([loader.loadAsync('models/blender/'+id+'.glb'),clips()]);return new Actor(id,g.scene,animations,true);}
 constructor(id,rig,animations,prepared=false){
  this.faceTime=0;this.faceMeshes=[];this.id=id;this.holder=new T.Group();this.holder.name=id;this.rig=rig;this.holder.add(rig);this.bones={};
  rig.traverse(n=>{if(n.isBone)this.bones[n.name]=n;if(n.isMesh){if(n.morphTargetDictionary)this.faceMeshes.push(n);n.castShadow=n.receiveShadow=true;if(!prepared)n.visible=false;}});
  if(!prepared)this.paint(palettes[id]);this.mixer=new T.AnimationMixer(rig);this.actions=new Map(animations.map(c=>{const clip=c.clone();clip.tracks=clip.tracks.filter(t=>T.PropertyBinding.findNode(rig,t.name.slice(0,t.name.lastIndexOf('.'))));return[c.name,this.mixer.clipAction(clip)];}));this.play('Idle_A');this.holder.scale.setScalar(1.22);this.travel=null;this.action='Idle_A';this.holder.userData.actor=id;
 }
 bone(name){return this.bones[name.replace('.','')]||this.bones[name];}
 paint(c){
  const b=n=>this.bone(n), limb=(name,len,width,color)=>{const joint=b(name);if(joint){oval(joint,color,[0,len*.46,0],[width,len*.57,width]);oval(joint,color,[0,0,0],[width*.97,width*.97,width*.97]);}};
  for(const side of ['l','r']){
   limb('upperleg.'+side,.227,.105,c.pants);limb('lowerleg.'+side,.149,.083,c.pants);
   limb('upperarm.'+side,.242,.087,c.shirt);limb('lowerarm.'+side,.26,.066,c.shirt);
   const hand=b('hand.'+side);if(hand)oval(hand,c.skin,[0,.055,.012],[.071,.083,.052]);
   const foot=b('foot.'+side);if(foot)oval(foot,c.boots,[0,.09,.025],[.10,.16,.075]);
  }
  oval(b('hips'),c.pants,[0,.03,0],[.22,.16,.135]);
  oval(b('spine'),c.shirt,[0,.14,0],[.235,.245,.145]);
  oval(b('chest'),c.shirt,[0,.035,0],[.25,.15,.15]);
  oval(b('spine'),0xeee2c6,[0,.19,.127],[.083,.19,.028]);
  for(let i=0;i<4;i++)oval(b('spine'),0xdab36f,[.10,.04+i*.077,.137],[.013,.013,.012]);
  const head=b('head');oval(head,c.skin,[0,.135,0],[.195,.23,.183]);
  oval(head,c.skin,[0,.095,.172],[.038,.048,.052]);
  for(const side of [-1,1]){
   oval(head,c.skin,[side*.184,.13,0],[.041,.065,.038]);
   oval(head,0xfff7e4,[side*.077,.176,.159],[.048,.056,.032]);
   oval(head,0x3e281e,[side*.073,.174,.185],[.024,.034,.013]);
   oval(head,0xffffff,[side*.066,.188,.196],[.009,.012,.006]);
   tube(head,c.hair,[[side*.12,.248,.152],[side*.075,.26,.17],[side*.035,.248,.164]],.013);
  }
  tube(head,0x80412f,[[-.054,.025,.163],[0,.014,.181],[.054,.025,.163]],.012);
  oval(head,c.hair,[0,.30,-.025],[.207,.13,.183]);
  for(let i=0;i<5;i++)oval(head,c.hair,[-.14+i*.069,.30+Math.sin(i)*.02,.112],[.073,.075,.075]);
  if(this.id==='raha'){
   oval(head,c.hair,[-.16,.19,.045],[.08,.16,.10]).rotation.z=-.20;
   oval(head,c.hair,[.16,.22,.025],[.075,.13,.09]).rotation.z=.25;
   for(let i=0;i<8;i++){const y=.16-i*.071,x=-.20-Math.sin(i*.6)*.025;oval(head,c.hair,[x,y,-.025],[.057-i*.003,.055,.052]);oval(head,0x483025,[x+.022,y+.015,.006],[.031,.036,.027]);}
   oval(head,0x447e68,[-.20,-.36,-.01],[.05,.019,.058]);
   for(const side of [-1,1]){oval(b('chest'),0xe9d8af,[side*.10,.08,.138],[.058,.12,.018]).rotation.z=side*.38;oval(b('spine'),0x96422d,[side*.15,-.01,.11],[.06,.075,.034]);}
   const bag=oval(b('hips'),0x8d5734,[-.27,.01,.035],[.12,.16,.10]);bag.rotation.z=-.12;
   tube(b('spine'),0x754426,[[.20,.34,.13],[0,.18,.17],[-.20,-.03,.14]],.024);
  }else if(this.id==='sohrab'){
   oval(head,c.hair,[-.05,.059,.178],[.07,.026,.033]);oval(head,c.hair,[.05,.059,.178],[.07,.026,.033]);
   const brim=new T.Mesh(new T.CylinderGeometry(.34,.34,.036,32),material(0xd7b777));brim.position.y=.39;head.add(brim);brim.castShadow=true;
   const hat=new T.Mesh(new T.CylinderGeometry(.20,.255,.20,24),material(0xc4a062));hat.position.y=.49;head.add(hat);hat.castShadow=true;
   const band=new T.Mesh(new T.CylinderGeometry(.239,.255,.04,24),material(0x4a6749));band.position.y=.41;head.add(band);
  }else{
   for(const x of [-.075,.075]){const ring=new T.Mesh(new T.TorusGeometry(.06,.009,5,20),material(0x513d2c));ring.position.set(x,.175,.202);head.add(ring);}
   tube(head,0x513d2c,[[-.016,.18,.20],[.016,.18,.20]],.009);
   oval(head,c.hair,[0,-.005,.10],[.13,.045,.075]);
  }
 }
 play(name,once=false){if(this.action===name&&!once)return;const next=this.actions.get(name)||this.actions.get('Idle_A');if(!next)return;const previous=this.current;next.reset().setEffectiveTimeScale(1).setEffectiveWeight(1);next.setLoop(once?T.LoopOnce:T.LoopRepeat,once?1:Infinity);next.clampWhenFinished=once;next.play();if(previous)previous.crossFadeTo(next,.22,false);this.current=next;this.action=name;this.holder.userData.animation=name;}
 place(x,z,rotation=0){this.holder.position.set(x,0,z);this.holder.rotation.y=rotation;}
 face(position,dt=1){const angle=Math.atan2(position.x-this.holder.position.x,position.z-this.holder.position.z);let diff=T.MathUtils.euclideanModulo(angle-this.holder.rotation.y+Math.PI,Math.PI*2)-Math.PI;this.holder.rotation.y+=diff*Math.min(1,dt*9);}
 async walk(points){if(!points.length)return;this.play('Walking_A');return new Promise(resolve=>{this.travel={points:points.map(p=>new T.Vector3(p.x,0,p.z)),index:0,resolve};});}
 async perform(name='Interact',seconds=.8){this.play(name,true);await new Promise(resolve=>{this.pending={time:seconds,resolve};});this.play('Idle_A');}
 update(dt){this.faceTime+=dt;const phase=this.faceTime%4.1,blink=Math.max(0,1-Math.abs(phase-3.8)/.095);for(const m of this.faceMeshes){const d=m.morphTargetDictionary;if(d.Blink!==undefined)m.morphTargetInfluences[d.Blink]=blink;if(d.Speak!==undefined)m.morphTargetInfluences[d.Speak]=this.talking?(Math.sin(this.faceTime*15)*.5+.5):0;}this.mixer.update(dt);if(this.travel){const t=this.travel,point=t.points[t.index],dist=point.distanceTo(this.holder.position);this.face(point,dt);const speed=2.1;if(dist<speed*dt){this.holder.position.copy(point);t.index++;if(t.index>=t.points.length){this.travel=null;this.play('Idle_A');t.resolve();}}else this.holder.position.addScaledVector(point.clone().sub(this.holder.position).normalize(),speed*dt);}if(this.pending){this.pending.time-=dt;if(this.pending.time<=0){const p=this.pending;this.pending=null;p.resolve();}}}
}

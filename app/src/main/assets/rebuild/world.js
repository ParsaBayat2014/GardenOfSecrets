import * as T from './vendor/three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';

const geometries={box:new T.BoxGeometry(1,1,1),ball:new T.SphereGeometry(1,12,8),cylinder:new T.CylinderGeometry(1,1,1,16),cone:new T.ConeGeometry(1,1,12)};
const palette={sand:0xe3c99d,cream:0xffedc8,teal:0x237d80,wood:0x80563b,roof:0xb96548,green:0x457d53,leaf:0x6f9d55};
const rough=new T.MeshStandardMaterial({roughness:.9}),gold=new T.MeshStandardMaterial({color:0xe8bf61,metalness:.62,roughness:.34});
const rnd=(n)=>{const s=Math.sin(n*127.1+3.7)*43758.54;return s-Math.floor(s);};
const mesh=(geo,material,pos,scale)=>{const m=new T.Mesh(geo,material);m.position.set(...pos);m.scale.set(...scale);m.castShadow=m.receiveShadow=true;return m;};

export const spots={
 garden:[['pot',-5,4.7,1.2,'گلدان رز'],['shed',-6,-3,2,'انبار باغبان'],['green',-7,1.4,2,'گلخانه'],['manor',3.6,-6,2.2,'در عمارت'],['fountain',0,1,1,'حوض باغ'],['bench',5.5,4.9,.8,'نیمکت کاشی‌کاری']],
 shed:[['box',-3,-2,1.4,'جعبه ابزار'],['handle',-1,-2,1.4,'دسته تبر'],['letter',1,-2,1.5,'نامه مادربزرگ'],['oil',4,-3,1.6,'روغن لولا']],
 green:[['cloth',-3,0,1.4,'دستمال'],['jug',-1,0,1.4,'آب‌پاش'],['flowers',0,-3,1.7,'پلاک گل‌ها'],['valve',4,-2,1.6,'شیر آب'],['gold',2,-3,1.6,'محفظه کلید']],
 archive:[['clock',-4,-3,2,'ساعت قدیمی'],['desk',0,-1,1.5,'میز تحریر'],['cabinet',4,-3,1.7,'صندوق اسناد'],['portrait',0,-4,3,'عکس مادربزرگ']]
};

export class World {
 constructor(scene){this.scene=scene;this.groups={};this.doors={};this.water=[];this.special={};this.pickups={};this.batches={};for(const name of Object.keys(spots)){this.group=new T.Group();this.group.name=name;this.groups[name]=this.group;this.batches={};if(name==='garden')this.garden();else this.room(name);this.flush();scene.add(this.group);this.group.visible=false;}this.upgrades={};for(const name of ['roses','lights','water']){this.group=new T.Group();this.batches={};if(name==='roses'){for(const x of [-3.5,3.5])this.plant(x,6.6,.9,true,33);}else if(name==='lights'){for(const [x,z]of [[-3,6.5],[6,6.7],[-3,-5],[7,-4]]){const light=new T.PointLight(0xffc16c,3.5,5,2);light.position.set(x,2.4,z);this.group.add(light);}}else{this.cyl(0,1.82,.3,.085,.45,0xe8d8ad);}this.flush();scene.add(this.group);this.group.visible=false;this.upgrades[name]=this.group;}this.set('garden');}
 async loadBlender(){
  const loader=new GLTFLoader();const loaded=await Promise.all(Object.keys(this.groups).map(async name=>[name,(await loader.loadAsync('models/blender/'+name+'.glb')).scene]));
  const water=this.water;for(const w of water)w.removeFromParent();
  for(const g of Object.values(this.groups))this.scene.remove(g);for(const g of Object.values(this.upgrades))this.scene.remove(g);
  this.doors={};this.pickups={};this.special={};this.upgrades={};
  for(const [name,g]of loaded){this.groups[name]=g;g.traverse(n=>{if(n.isMesh){n.castShadow=n.receiveShadow=true;}const role=n.userData.role||'';
   if(n.name.startsWith('Door_'))this.doors[n.name.slice(5)]={hinge:n,target:0};
   if(role.startsWith('pickup:'))this.pickups[role.slice(7)]=n;
   if(role.startsWith('special:'))this.special[role.slice(8)]=n;
   if(n.name.startsWith('Upgrade_'))this.upgrades[n.name.slice(8)]=n;
  });this.scene.add(g);}
  this.special.lid=this.special.lid||this.pickups.box;for(const w of water)this.groups.garden.add(w);this.set(this.current||'garden');
  for(const id of ['key','pool','pot'])if(!this.special[id])throw new Error('Missing Blender interaction: '+id);
 }
 pickup(id,type,pos,scale,color){const m=mesh(geometries[type],new T.MeshStandardMaterial({color,roughness:.7}),pos,scale);this.group.add(m);this.pickups[id]=m;return m;}
 add(type,x,y,z,sx,sy,sz,color,rotation=0){const entry=this.batches[type]||(this.batches[type]=[]);entry.push({x,y,z,sx,sy,sz,color,rotation});}
 box(x,y,z,w,h,d,c,r=0){this.add('box',x,y,z,w,h,d,c,r);}
 ball(x,y,z,w,h,d,c){this.add('ball',x,y,z,w,h,d,c);}
 cyl(x,y,z,r,h,c){this.add('cylinder',x,y,z,r,h,r,c);}
 flush(){const dummy=new T.Object3D(),color=new T.Color();for(const [type,items]of Object.entries(this.batches)){const batch=new T.InstancedMesh(geometries[type],rough,items.length);for(let i=0;i<items.length;i++){const s=items[i];dummy.position.set(s.x,s.y,s.z);dummy.rotation.set(0,s.rotation,0);dummy.scale.set(s.sx,s.sy,s.sz);dummy.updateMatrix();batch.setMatrixAt(i,dummy.matrix);batch.setColorAt(i,color.setHex(s.color));}batch.castShadow=batch.receiveShadow=true;this.group.add(batch);}this.batches={};}
 arch(x,y,z,w,h,color){const shape=new T.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(w/2,h-w/2);shape.absarc(0,h-w/2,w/2,0,Math.PI,false);shape.lineTo(-w/2,0);const geometry=new T.ExtrudeGeometry(shape,{depth:.12,bevelEnabled:true,bevelThickness:.035,bevelSize:.025,bevelSegments:2,steps:1,curveSegments:16});const m=new T.Mesh(geometry,new T.MeshStandardMaterial({color,roughness:.7}));m.position.set(x,y,z);m.castShadow=true;this.group.add(m);return m;}
 door(id,x,z,width=1.5,height=2.7){this.arch(x-.02,.2,z-.09,width+.25,height+.16,0xe0b97c);const hinge=new T.Group();hinge.position.set(x-width/2,.25,z);const panel=mesh(geometries.box,new T.MeshStandardMaterial({color:palette.teal,roughness:.65}),[width/2,height/2,0],[width,height,.16]);hinge.add(panel);for(let i=0;i<4;i++){const slat=mesh(geometries.box,new T.MeshStandardMaterial({color:0x1c666a}),[(i+.5)*width/4,height*.48,.095],[.026,height*.88,.025]);hinge.add(slat);}hinge.add(mesh(new T.SphereGeometry(.07,10,8),gold,[width*.86,height*.45,.14],[1,1,1]));this.group.add(hinge);this.doors[id]={hinge,target:0};return hinge;}
 plant(x,z,size=1,flowers=true,seed=1){this.cyl(x,.19*size,z,.38*size,.38*size,0xb96e49);this.cyl(x,.40*size,z,.43*size,.10*size,0xd19466);this.cyl(x,.44*size,z,.35*size,.03,0x4b4630);for(let i=0;i<7;i++){const a=i*2.4,rr=.30*size*Math.sqrt(rnd(seed+i)),px=x+Math.cos(a)*rr,pz=z+Math.sin(a)*rr;this.ball(px,(.67+rnd(i+seed)*.4)*size,pz,.26*size,.35*size,.25*size,i%2?0x578b4a:0x2e694a);if(flowers){const yy=(.9+rnd(i+seed)*.4)*size;for(let p=0;p<5;p++){const angle=p*Math.PI*2/5;this.ball(px+Math.cos(angle)*.10*size,yy,pz+Math.sin(angle)*.10*size,.105*size,.055*size,.10*size,[0xf0a8a4,0xe57b89,0xffd8af][i%3]);}this.ball(px,yy+.025,pz,.053*size,.04*size,.05*size,0xf5d487);}}}
 tree(x,z,size=1,seed=1){this.cyl(x,1.2*size,z,.16*size,2.4*size,0x866349);for(let i=0;i<6;i++){const a=i*2.4,r=(.3+rnd(seed+i)*.8)*size;this.ball(x+Math.cos(a)*r,(2.6+rnd(seed+i+7)*.9)*size,z+Math.sin(a)*r,(.75+rnd(i)*.3)*size,.9*size,.8*size,[0x4f854f,0x668c4e,0x789f58][i%3]);}}
 bench(x,z){for(const xx of [-.9,.9]){this.box(x+xx,.33,z,.25,.65,.65,0xd8be8a);}for(let i=0;i<6;i++)this.box(x,.7,z-.35+i*.14,2.4,.13,.12,i%2?0xd6bd8b:0xe7cea5);this.box(x,.95,z-.42,2.4,.5,.12,palette.teal);for(let i=0;i<9;i++)this.box(x-1+i*.25,.97,z-.345,.12,.12,.02,i%2?0xe3c696:0x41999b);}
 building(x,z,w,d,h){this.box(x,h/2,z,w,h,d,palette.cream);this.box(x,.24,z+d/2+.45,w+.7,.45,1.2,0xcfb78c);this.box(x,.48,z+d/2+.10,w+.3,.20,.8,0xdfc89f);this.box(x,h,z,w+.5,.24,d+.5,palette.teal);this.box(x,h+.18,z,w+.7,.16,d+.7,0xe1c799);for(const xx of [-w/2+.25,w/2-.25]){this.box(x+xx,h/2,z+d/2+.07,.28,h+.15,.28,0xe4cba1);this.box(x+xx,h-.25,z+d/2+.14,.48,.25,.38,palette.teal);}}
 garden(){
  this.box(0,-.53,0,23,1,22,0xbda67b);this.box(0,-.03,0,22.5,.15,21.5,0xdcc59c);
  for(let x=-10;x<=10;x++)for(let z=-9;z<=9;z++){if(Math.abs(x)>8||z<-6)continue;this.box(x*1.04,.06,z*1.04,1.015,.09,1.015,[0xe4d4ad,0xe7d8b8,0xd7c49f,0xe9d7ae][Math.floor(rnd(x*99+z)*4)]);}
  this.building(3.5,-8,8,3.4,4.6);this.door('manor',3.6,-6.22,1.7,2.8);
  for(const x of [.9,6.2]){this.arch(x,1.65,-6.20,1.05,1.8,0x9bc1b3);this.arch(x,1.77,-6.05,.85,1.55,0x376e73);this.box(x,2.4,-5.91,.045,1.15,.06,0xe2bf7b);this.box(x,2.39,-5.91,.82,.045,.06,0xe2bf7b);this.plant(x,-5.7,.65,true,x*5);}
  this.box(3.5,3.7,-6.02,7.5,.16,.35,0xc7aa78);this.box(3.5,4.6,-8,7.1,.25,2.2,0xc58159);
  this.building(-6,-4.8,4,2.6,2.7);this.door('shed',-6,-3.45,1.35,2.25);for(let i=0;i<9;i++)this.box(-8+i*.5,2.93,-4.8,.47,.24,3.1,i%2?0xa65f43:0xb8744d);
  // Glasshouse: repeated slim ribs, transparent glass and raised beds.
  const glass=new T.MeshStandardMaterial({color:0x9ac8bd,transparent:true,opacity:.24,roughness:.2,metalness:.1,side:T.DoubleSide,depthWrite:false});
  const greenhouse=mesh(geometries.box,glass,[-8,1.6,1.3],[3.3,3,4.3]);greenhouse.castShadow=false;this.group.add(greenhouse);
  for(let j=0;j<5;j++){const z=-.7+j;for(const x of [-9.7,-6.3])this.box(x,1.55,z,.07,3.1,.07,0x467d6a);this.box(-8,3.1,z,3.5,.08,.08,0x467d6a);}this.door('green',-8,3.5,1.35,2.4);
  this.cyl(0,.30,.3,2.2,.6,0xd5bc88);this.cyl(0,.62,.3,2.25,.12,0xe7d2a8);this.cyl(0,.69,.3,1.98,.05,0x2b898b);
  for(let i=0;i<40;i++){const a=i*Math.PI/20;this.box(Math.cos(a)*2.19,.38,.3+Math.sin(a)*2.19,.12,.24,.12,i%2?0x2a9397:0xf1dfa5,a);}
  const water=mesh(new T.CircleGeometry(1.94,48),new T.MeshStandardMaterial({color:0x62b7b2,transparent:true,opacity:.79,roughness:.15,metalness:.22}),[0,.735,.3],[1,1,1]);water.rotation.x=-Math.PI/2;water.castShadow=false;this.group.add(water);this.special.pool=water;
  this.cyl(0,1,.3,.25,.7,0xddc99e);this.cyl(0,1.32,.3,.78,.15,0xe7d6b3);this.cyl(0,1.48,.3,.16,.20,0xe5c995);this.ball(0,1.68,.3,.14,.20,.14,0xcab17c);
  const drops=new T.InstancedMesh(new T.SphereGeometry(.035,5,4),new T.MeshStandardMaterial({color:0xbcf2e4,transparent:true,opacity:.8}),64);drops.castShadow=false;this.group.add(drops);this.water.push(drops);
  this.flush();const garden=this.group,pot=new T.Group();garden.add(pot);pot.position.set(-5,0,4.7);this.group=pot;this.plant(0,0,1.6,true,18);this.flush();this.special.pot=pot;this.group=garden;this.bench(5.5,4.8);
  for(let i=0;i<14;i++){const z=-8+i*1.35;this.tree(i%2?-10.2:10.2,z,.8+rnd(i)*.3,i);}
  for(let i=0;i<12;i++){const x=-9+i*1.6;this.box(x,.18,8.9,1.45,.35,1.6,0x7b9b55);this.plant(x,8.9,.8,true,i);}
  for(const [x,z]of [[-3,6.5],[6,6.7],[-3,-5],[7,-4]]){this.cyl(x,1.2,z,.045,2.4,0x4b5e4e);const frame=mesh(geometries.box,new T.MeshStandardMaterial({color:0xe2bb67,emissive:0xeaa75b,emissiveIntensity:.35}),[x,2.4,z],[.22,.38,.22]);this.group.add(frame);this.add('cone',x,2.7,z,.23,.18,.23,0x415b4b);}
  // Hidden key is a real object, revealed when the pot moves.
  const key=new T.Group();const ring=new T.Mesh(new T.TorusGeometry(.12,.032,6,16),gold);ring.rotation.x=-Math.PI/2;key.add(ring);key.add(mesh(geometries.box,gold,[.22,0,0],[.32,.045,.045]));key.position.set(-4.5,.22,4.4);this.group.add(key);this.special.key=key;
 }
 room(name){
  const wood=name==='green'?0xc0b48a:0xa77a50;this.box(0,-.25,0,13,.5,11,0xc5ac82);for(let i=0;i<22;i++)this.box(-6+i*.57,.03,0,.55,.07,10.7,wood);
  this.box(0,2,-5.3,13,4,.25,name==='shed'?0xc7ae7e:0xe7d7b4);this.box(-6.4,2,0,.25,4,10.7,0xd8c7a3);this.box(0,.22,-5.1,12.8,.35,.25,0x947449);
  for(const x of [-4,0,4]){this.arch(x,1.4,-5.1,1.6,2,0x438482);this.box(x,2.4,-4.9,.06,1.8,.06,0xe1c18a);this.box(x,2.4,-4.9,1.4,.06,.06,0xe1c18a);}
  const table=(x,z,w=2.5)=>{this.box(x,1.08,z,w,.18,1.2,0x9b6846);for(const xx of [-w*.4,w*.4])for(const zz of [-.42,.42])this.box(x+xx,.5,z+zz,.10,1,.10,0x775038);};
  if(name==='shed'){
   table(-2,-2,4);table(2,-2,3);this.box(-3,1.45,-2,1.2,.6,.65,0x557c68);const lid=this.pickup('box','box',[-3,1.77,-2],[1.26,.09,.7],0xba9962);this.special.lid=lid;this.pickup('handle','box',[-1,1.23,-2],[1.2,.10,.11],0x79513a);this.box(1,1.22,-2,.7,.025,.48,0xf0e3b7,.17);this.pickup('oil','cylinder',[4,2.85,-3],[.14,.45,.14],0xb1b569);
   for(let j=0;j<3;j++){this.box(4,.5+j*.9,-3,2,.12,1.2,0x8b6041);for(let i=0;i<4;i++)this.cyl(3.4+i*.38,.75+j*.9,-3,.12,.4,[0x83915d,0xa8744d,0x4c8585][i%3]);}
   this.plant(-5,3,.8,false);for(let i=0;i<3;i++)this.box(4.5,.4+i*.7,2.7,1.1,.7,1,0x9a734b);
  }else if(name==='green'){
   table(-2,0,5);this.pickup('cloth','box',[-3,1.2,0],[.7,.03,.5],0xf4ede2);this.pickup('jug','cylinder',[-1,1.43,0],[.22,.5,.22],0x4b8e87);
   for(let i=-4;i<=4;i+=2)this.plant(i,-3,1.15,true,i+8);
   this.cyl(4,.8,-2,.08,1.6,0x65988b);this.box(4,1.65,-2,.5,.07,.07,0xd1aa65);this.box(2,1.3,-3,.9,1,.7,0x3f8d8c);this.box(2,1.84,-3,1,.12,.8,0xe0bd76);this.pickup('gold','ball',[2,1.95,-3],[.12,.08,.12],0xe8bf61);
   for(let j=0;j<6;j++){this.box(-5.6+j*2.2,3.9,0,.06,.06,10,0x548b74);}this.plant(4,3,1.2,true,20);
  }else{
   table(0,-1,3.8);this.box(0,1.23,-1,1.5,.035,1,0xece0bd);this.cyl(-1.3,1.4,-1,.13,.5,0xb0975b);
   this.box(4,1.2,-3,2.4,2.4,1,0x896348);this.door('cabinet',4,-2.4,2.2,2.1);
   this.box(-4,1.75,-3,1.15,3.5,.7,0x80583b);const face=new T.Mesh(new T.CircleGeometry(.44,32),new T.MeshStandardMaterial({color:0xf5e6bd}));face.position.set(-4,2.85,-2.62);this.group.add(face);this.box(-4,2.94,-2.59,.035,.28,.025,0x4a5b49);this.box(-3.89,2.85,-2.58,.28,.035,.025,0x4a5b49);
   for(let j=0;j<4;j++)for(let i=0;i<9;i++)this.box(-2+i*.45,.6+j*.5,-4.8,.32,.40,.25,[0x697b5a,0xa3654f,0x5b7f8a,0xe0bc83][i%4]);this.plant(-5,2,1.2,false,1);
  }
 }
 set(name){for(const [id,g]of Object.entries(this.groups))g.visible=id===name;this.current=name;}
 apply(state){const f=state.flags;if(this.doors.shed)this.doors.shed.target=f.shed?-Math.PI*.62:0;if(this.doors.manor)this.doors.manor.target=f.inner?-Math.PI*.62:f.outer?-.35:0;if(this.doors.cabinet)this.doors.cabinet.target=f.cabinet?-Math.PI*.6:0;this.special.key.visible=!f.pot;this.special.pool.visible=!!f.valve;this.potMoved=!!f.pot;for(const [id,m]of Object.entries(this.pickups)){m.visible=id==='box'||!f[id];if(id==='gold')m.visible=!!f.valve&&!f.gold;}for(const [id,g]of Object.entries(this.upgrades))g.visible=this.current==='garden'&&state.renovations.includes(id);for(const w of this.water)w.visible=!!f.valve;this.boxOpened=!!f.box;}
 tick(dt,time){for(const {hinge,target}of Object.values(this.doors))hinge.rotation.y=T.MathUtils.damp(hinge.rotation.y,target,7,dt);if(this.special.pot){this.special.pot.position.x=T.MathUtils.damp(this.special.pot.position.x,this.potMoved?-5.65:-5,6,dt);this.special.pot.rotation.y=T.MathUtils.damp(this.special.pot.rotation.y,this.potMoved?.4:0,6,dt);}if(this.special.lid)this.special.lid.rotation.x=T.MathUtils.damp(this.special.lid.rotation.x,this.boxOpened?-1.1:0,7,dt);const dummy=new T.Object3D();for(const water of this.water){if(!water.visible)continue;for(let i=0;i<64;i++){const t=(time*.55+i/64)%1,a=i%8/8*Math.PI*2,r=.75*t;dummy.position.set(Math.cos(a)*r,1.5+Math.sin(t*Math.PI)*.7-t*.65,.3+Math.sin(a)*r);dummy.scale.setScalar(.65+Math.sin(t*Math.PI)*.4);dummy.updateMatrix();water.setMatrixAt(i,dummy.matrix);}water.instanceMatrix.needsUpdate=true;}if(this.special.key)this.special.key.rotation.y=time*.35;}
}

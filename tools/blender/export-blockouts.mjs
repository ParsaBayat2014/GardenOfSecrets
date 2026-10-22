import fs from 'node:fs/promises';
import * as T from '../../app/src/main/assets/rebuild/vendor/three.module.js';
import {World} from '../../app/src/main/assets/rebuild/world.js';
import {Actor} from '../../app/src/main/assets/rebuild/actors.js';
import {GLTFExporter} from '../../app/src/main/assets/rebuild/vendor/GLTFExporter.js';
import {GLTFLoader} from '../../app/src/main/assets/rebuild/vendor/GLTFLoader.js';
globalThis.self=globalThis;
globalThis.FileReader=class{readAsArrayBuffer(blob){blob.arrayBuffer().then(b=>{this.result=b;this.onloadend?.();this.onload?.();});}readAsDataURL(blob){blob.arrayBuffer().then(b=>{this.result='data:'+blob.type+';base64,'+Buffer.from(b).toString('base64');this.onloadend?.();this.onload?.();});}};
const root=new URL('../../',import.meta.url),out=new URL('art-source/blender/blockouts/',root);await fs.mkdir(out,{recursive:true});
const scene=new T.Scene(),world=new World(scene),exporter=new GLTFExporter(),loader=new GLTFLoader();
for(const [id,door]of Object.entries(world.doors)){door.hinge.name='Door_'+id;door.hinge.userData.role='door:'+id;}
for(const [id,m]of Object.entries(world.pickups)){m.name='Pickup_'+id;m.userData.role='pickup:'+id;}
for(const [id,m]of Object.entries(world.special)){if(m.name?.startsWith('Pickup'))continue;m.name='Special_'+id;m.userData.role='special:'+id;}
for(const [id,g]of Object.entries(world.upgrades)){g.name='Upgrade_'+id;g.visible=true;}
for(const w of world.water)w.visible=false;
function expand(group){const source=[];group.traverse(n=>{if(n.isInstancedMesh)source.push(n);});for(const n of source){const parent=n.parent,g=new T.Group();g.name='Static_'+n.geometry.type;g.copy(n,false);parent.remove(n);parent.add(g);const cache=new Map();for(let i=0;i<n.count;i++){const color=new T.Color();if(n.instanceColor)n.getColorAt(i,color);else color.copy(n.material.color);const key=color.getHexString();if(!cache.has(key)){const m=n.material.clone();m.color.copy(color);cache.set(key,m);}const m=new T.Mesh(n.geometry,cache.get(key));const matrix=new T.Matrix4();n.getMatrixAt(i,matrix);matrix.decompose(m.position,m.quaternion,m.scale);m.name=n.geometry.type+'_'+i;m.userData.primitive=n.geometry.type;g.add(m);}}}
for(const [name,g]of Object.entries(world.groups)){g.visible=true;if(name==='garden')for(const u of Object.values(world.upgrades))g.add(u);expand(g);g.updateMatrixWorld(true);const data=await exporter.parseAsync(g,{binary:true,onlyVisible:true,trs:true});await fs.writeFile(new URL(name+'.glb',out),Buffer.from(data));console.log(name,data.byteLength);}
async function glb(name){const b=await fs.readFile(new URL('app/src/main/assets/rebuild/models/'+name+'.glb',root));return loader.parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');}
const [general,movement]=await Promise.all([glb('general'),glb('movement')]);
for(const id of ['raha','sohrab','saman']){const base=await glb('rig'),actor=new Actor(id,base.scene,[...general.animations,...movement.animations]);actor.mixer.stopAllAction();actor.rig.updateMatrixWorld(true);const data=await exporter.parseAsync(actor.rig,{binary:true,onlyVisible:true,trs:true});await fs.writeFile(new URL(id+'.glb',out),Buffer.from(data));console.log(id,data.byteLength);}

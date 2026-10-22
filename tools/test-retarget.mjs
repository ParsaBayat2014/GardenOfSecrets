import assert from 'node:assert/strict';
import * as T from '../app/src/main/assets/rebuild/vendor/three.module.js';
import {retargetClips} from '../app/src/main/assets/rebuild/retarget.js';
const source=new T.Group(),target=new T.Group(),from=new T.Bone(),to=new T.Bone();from.name=to.name='hips';source.add(from);target.add(to);from.position.y=1;to.position.y=2;to.quaternion.setFromAxisAngle(new T.Vector3(0,0,1),.2);
const original=new T.AnimationClip('test',1,[new T.VectorKeyframeTrack('hips.position',[0,1],[0,1,0,0,1.2,0]),new T.QuaternionKeyframeTrack('hips.quaternion',[0,1],[0,0,0,1,0,0,0,1]),new T.VectorKeyframeTrack('missing.position',[0],[0,0,0])]);
const [result]=retargetClips([original],source,target);assert.equal(result.tracks.length,2);assert(Math.abs(result.tracks[0].values[1]-2)<1e-6);assert(Math.abs(result.tracks[0].values[4]-2.2)<1e-6);assert.equal(original.tracks[0].values[1],1);assert(new T.Quaternion().fromArray(result.tracks[1].values).angleTo(to.quaternion)<1e-3);console.log('PASS: translated bind pose, orientation correction, unmapped track rejection and unchanged source clips.');

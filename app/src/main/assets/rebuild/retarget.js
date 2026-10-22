import * as T from './vendor/three.module.js';

// Preserve each clip's motion relative to its source bind pose. The new
// Blender skeleton has longer legs, so replaying absolute old translations
// would pull the hips and limbs back into the old proportions.
export function retargetClips(clips,source,target){
 return clips.map(original=>{
  const clip=original.clone();
  clip.tracks=clip.tracks.filter(track=>{
   const split=track.name.lastIndexOf('.'),name=track.name.slice(0,split);
   const to=T.PropertyBinding.findNode(target,name),from=T.PropertyBinding.findNode(source,name);
   if(!to)return false;
   if(!from)return true;
   const property=track.name.slice(split+1),values=track.values;
   if(property==='position'){
    const delta=to.position.clone().sub(from.position);
    for(let i=0;i<values.length;i+=3){values[i]+=delta.x;values[i+1]+=delta.y;values[i+2]+=delta.z;}
   }else if(property==='quaternion'){
    const correction=to.quaternion.clone().multiply(from.quaternion.clone().invert()),q=new T.Quaternion();
    for(let i=0;i<values.length;i+=4){q.fromArray(values,i).premultiply(correction).normalize().toArray(values,i);}
   }
   return true;
  });
  return clip;
 });
}

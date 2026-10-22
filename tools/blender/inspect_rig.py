import bpy
from pathlib import Path
bpy.ops.wm.read_factory_settings(use_empty=True)
p=Path(r'D:/APKgame/GardenOfSecrets/app/src/main/assets/rebuild/models/general.glb')
bpy.ops.import_scene.gltf(filepath=str(p))
print('ARMATURES',[(o.name,len(o.data.bones))for o in bpy.data.objects if o.type=='ARMATURE'])
print('ACTIONS',[(a.name,len(a.slots)) for a in bpy.data.actions])
for o in bpy.data.objects:
 if o.type=='ARMATURE':
  print('BONES',[(b.name,tuple(round(v,3)for v in b.head_local),tuple(round(v,3)for v in b.tail_local))for b in o.data.bones][:10]);break

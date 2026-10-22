import bpy,sys,math
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2];SRC=ROOT/'art-source/blender';OUT=ROOT/'app/src/main/assets/rebuild/models/blender'
for ident in ['raha','sohrab','saman']:
 bpy.ops.wm.read_factory_settings(use_empty=True)
 bpy.ops.import_scene.gltf(filepath=str(ROOT/'app/src/main/assets/rebuild/models/general.glb'))
 arm=next(o for o in bpy.data.objects if o.type=='ARMATURE');arm.animation_data_clear();arm.data.pose_position='REST'
 for o in list(bpy.data.objects):
  if o.type=='MESH':bpy.data.objects.remove(o,do_unlink=True)
 bones={b.name.replace('.',''):b.name for b in arm.data.bones};prior=set(bpy.data.objects)
 bpy.ops.import_scene.gltf(filepath=str(SRC/'blockouts'/f'{ident}.glb'))
 imported=[o for o in bpy.data.objects if o not in prior];imported_names=[o.name for o in imported];parts=[]
 bpy.context.view_layer.update()
 for o in imported:
  if o.type!='MESH':continue
  p=o.parent;bone=None
  while p:
   if p.name.split('.')[0] in bones:bone=bones[p.name.split('.')[0]];break
   if p.name.replace('.','') in bones:bone=bones[p.name.replace('.','')];break
   p=p.parent
  if not bone:continue
  o.data=o.data.copy();world=o.matrix_world.copy();o.parent=None;o.matrix_world=world
  bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
  g=o.vertex_groups.new(name=bone);g.add(list(range(len(o.data.vertices))),1,'REPLACE')
  for f in o.data.polygons:f.use_smooth=True
  parts.append(o)
 bpy.ops.object.select_all(action='DESELECT')
 for o in parts:o.select_set(True)
 if not parts:raise RuntimeError('No character parts mapped')
 bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join();body=bpy.context.object;body.name=ident+'_Blender_Costume';mod=body.modifiers.new('Articulated character skin','ARMATURE');mod.object=arm;body.parent=arm
 for name in imported_names:
  o=bpy.data.objects.get(name)
  if o and o!=body:bpy.data.objects.remove(o,do_unlink=True)
 arm.data.pose_position='POSE'
 bpy.ops.wm.save_as_mainfile(filepath=str(SRC/f'{ident}-master.blend'))
 bpy.ops.export_scene.gltf(filepath=str(OUT/f'{ident}.glb'),export_format='GLB',export_animations=False,export_cameras=False,export_lights=False)
 print('BLENDER_CHARACTER_COMPLETE',ident,len(parts),flush=True)

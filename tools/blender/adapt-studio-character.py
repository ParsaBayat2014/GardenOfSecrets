"""Adapt Blender Studio Ellie (CC-BY), bake a mobile atlas and map to the game rig.
Source: https://www.blender.org/download/demo-files/#assets . Attribution is mandatory.
"""
import bpy,math,json,re
from pathlib import Path
from mathutils import Vector,Matrix,Quaternion
R=Path(__file__).resolve().parents[2];A=R/'art-source';T=A/'textures/studio-raha';T.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(A/'vendor/ellie-original.blend'),use_scripts=False)
scene=bpy.context.scene
if bpy.context.object and bpy.context.object.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
source_rig=next(o for o in scene.objects if o.type=='ARMATURE');source_rig.animation_data_clear()
for b in source_rig.pose.bones:b.matrix_basis.identity()
source_rig.data.pose_position='REST';scene.render.use_stamp=False
for c in bpy.data.collections:
 if 'hair.particles' in c.name:c.hide_render=True;c.hide_viewport=True
 if 'hair.mesh' in c.name:c.hide_render=False;c.hide_viewport=False
# The mobile version uses the actual hair mesh, not particle hair or its helpers.
for o in scene.objects:
 if o.name.startswith(('GEO-ellie_hair.','GEO-ellie_hair_cut.')):
  if o.animation_data:o.animation_data_clear()
  o.hide_render='hair_cut' in o.name;o.hide_viewport=o.hide_render;o.hide_set(o.hide_render)
 if o.name.startswith(('GEO-ellie_jacket_pin','GEO-ellie_earrings','GEO-ellie_watch')):o.hide_render=True
 for mod in o.modifiers:
  if mod.type=='SUBSURF':mod.levels=mod.render_levels=1
# Recolor denim to the garden's teal palette, retaining source weave and stitching.
for name in ['ellie.denim','ellie.denim_inside']:
 material=bpy.data.materials.get(name)
 if not material:continue
 tree=material.node_tree
 for node in list(tree.nodes):
  if node.type=='BSDF_PRINCIPLED':
   base=node.inputs['Base Color']
   hue=tree.nodes.new('ShaderNodeHueSaturation');hue.name='Garden teal adaptation';hue.inputs['Hue'].default_value=.40;hue.inputs['Saturation'].default_value=1.10;hue.inputs['Value'].default_value=.86
   if base.is_linked:tree.links.new(base.links[0].from_socket,hue.inputs['Color'])
   else:hue.inputs['Color'].default_value=base.default_value
   tree.links.new(hue.outputs['Color'],base)
for name,value in [('ellie.fannypack_magenta',0x815337),('ellie.fannypack_green',0x2D7573),('ellie.fannypack_purple',0x47352A)]:
 m=bpy.data.materials.get(name)
 if m:
  for node in m.node_tree.nodes:
   if node.type=='BSDF_PRINCIPLED':
    socket=node.inputs['Base Color']
    for link in list(socket.links):m.node_tree.links.remove(link)
    socket.default_value=(*[(((value>>c)&255)/255)**2.2 for c in [16,8,0]],1)
highlight=bpy.data.materials.get('ellie.highlights')
if highlight:
 highlight.node_tree.nodes.clear();p=highlight.node_tree.nodes.new('ShaderNodeBsdfPrincipled');p.inputs['Base Color'].default_value=(1,1,1,1);out=highlight.node_tree.nodes.new('ShaderNodeOutputMaterial');highlight.node_tree.links.new(p.outputs[0],out.inputs['Surface'])
# Capture only production meshes visible in this scene. Helpers and source logos are excluded.
chosen=[]
for o in list(scene.objects):
 if not o.name.startswith('GEO-ellie_')or o.type!='MESH' or o.hide_render:continue
 if any(s in o.name for s in ['helper','deformer','groom','scalp','rig_']):continue
 chosen.append(o)
print('SOURCE_MESHES',len(chosen),[o.name for o in chosen],flush=True)
dg=bpy.context.evaluated_depsgraph_get();snapshots=[]
for o in chosen:
 data=bpy.data.meshes.new_from_object(o.evaluated_get(dg),preserve_all_data_layers=True,depsgraph=dg)
 if not len(data.polygons):continue
 copy=bpy.data.objects.new('Mobile_'+o.name,data);scene.collection.objects.link(copy);copy.matrix_world=o.matrix_world.copy();copy['source_object']=o.name
 for g in o.vertex_groups:copy.vertex_groups.new(name=g.name)
 if not data.uv_layers:data.uv_layers.new(name='UVMap')
 primary=data.uv_layers[0];primary.active_render=True
 source=data.uv_layers.new(name='SourceUV')
 for i in range(len(primary.data)):source.data[i].uv=primary.data[i].uv
 data.uv_layers.new(name='BakeAtlas');data.uv_layers.active_index=len(data.uv_layers)-1
 if 'GEO-ellie_hair.' in o.name:
  pivot=source_rig.data.bones['DEF-Ponytail1'].head_local.copy();names=[g.name for g in copy.vertex_groups]
  for vertex in data.vertices:
   weight=min(1,sum(g.weight for g in vertex.groups if 'Ponytail' in names[g.group]))
   if weight>0:vertex.co=pivot+Quaternion((1,0,0),math.radians(-140)*weight)@(vertex.co-pivot)
 snapshots.append(copy)
print('MOBILE_VERTICES',sum(len(o.data.vertices)for o in snapshots),flush=True)
# Pin source texture coordinates before making a separate atlas UV layout.
visited=set()
def source_uv(tree):
 if tree.name in visited:return
 visited.add(tree.name);uv=tree.nodes.new('ShaderNodeUVMap');uv.uv_map='SourceUV'
 for node in list(tree.nodes):
  if node.type=='TEX_IMAGE'and not node.inputs['Vector'].is_linked:tree.links.new(uv.outputs[0],node.inputs['Vector'])
  if node.type=='TEX_COORD':
   for link in list(node.outputs['UV'].links):tree.links.new(uv.outputs[0],link.to_socket)
  if node.type=='GROUP'and node.node_tree:source_uv(node.node_tree)
for m in set(m for o in snapshots for m in o.data.materials if m):source_uv(m.node_tree)
bpy.ops.object.select_all(action='DESELECT')
for o in snapshots:o.hide_set(False);o.select_set(True)
# Reserve continuous source UV regions for the face, body and clothes.
# Thousands of tiny automatic islands wasted most pixels in the first trial.
regions={'head':(0,16,16,16),'jacket':(0,0,16,16),'body':(16,16,8,16),'hair':(24,0,8,16),'boots':(16,0,8,16),'trousers':(24,16,8,8),'eye.L':(24,24,4,4),'eye.R':(28,24,4,4)}
small=0
for o in snapshots:
 key=o['source_object'].removeprefix('GEO-ellie_').removesuffix('.001');region=regions.get(key)
 if region is None:
  region=(24+small%8,28+small//8,1,1);small+=1
 x,y,w,h=region;source=o.data.uv_layers['SourceUV'];atlas=o.data.uv_layers['BakeAtlas'];xs=[d.uv.x for d in source.data];ys=[d.uv.y for d in source.data]
 loX=min(0,min(xs));hiX=max(1,max(xs));loY=min(0,min(ys));hiY=max(1,max(ys))
 for i,d in enumerate(source.data):atlas.data[i].uv=((x+.06+(d.uv.x-loX)/(hiX-loX)*(w-.12))/32,(y+.06+(d.uv.y-loY)/(hiY-loY)*(h-.12))/32)
 o.data.uv_layers.active_index=len(o.data.uv_layers)-1
 # Real source facial poses become lightweight runtime morphs.
 for name in ['Basis','Blink','Speak','Smile']:o.shape_key_add(name=name).value=0
face_objects=[o for o in chosen if any(t in o.name for t in ['head.','eye.','eyelash','eyebrow','teeth','tongue'])]
source_rig.data.pose_position='POSE';bpy.context.view_layer.update()
def evaluate_points(o):
 dg=bpy.context.evaluated_depsgraph_get();evaluated=o.evaluated_get(dg);data=evaluated.to_mesh();points=[v.co.copy()for v in data.vertices];evaluated.to_mesh_clear();return points
neutral={o.name:evaluate_points(o)for o in face_objects}
for target,action_name in [('Blink','Ellie eyemask closed'),('Speak','Ellie mouth Ee'),('Smile','Ellie mouth smileclosed')]:
 action=bpy.data.actions.get(action_name);source_rig.animation_data_create();source_rig.animation_data.action=action
 if action.slots:source_rig.animation_data.action_slot=action.slots[0]
 scene.frame_set(int(action.frame_range[0]));bpy.context.view_layer.update()
 changed={o.name:evaluate_points(o)for o in face_objects}
 for o in snapshots:
  name=o['source_object']
  if name not in neutral:continue
  if len(changed[name])!=len(o.data.vertices):raise RuntimeError('Face topology changed: '+name)
  key=o.data.shape_keys.key_blocks[target]
  for i,(a,b)in enumerate(zip(neutral[name],changed[name])):key.data[i].co+=b-a
 print('CAPTURED_FACE_POSE',target,flush=True)
 source_rig.animation_data_clear()
 for b in source_rig.pose.bones:b.matrix_basis.identity()
 bpy.context.view_layer.update()
source_rig.data.pose_position='REST'
# Restore selection after the source rig was evaluated.
bpy.ops.object.select_all(action='DESELECT')
for o in snapshots:o.select_set(True)
bpy.context.view_layer.objects.active=snapshots[0]
scene.render.engine='CYCLES';scene.cycles.samples=1;scene.render.bake.use_pass_direct=False;scene.render.bake.use_pass_indirect=False;scene.render.bake.use_pass_color=True;scene.render.bake.use_clear=False;scene.render.bake.margin=8
materials=set(m for o in snapshots for m in o.data.materials if m)
def bake(name,kind,size,colorspace):
 image=bpy.data.images.new(name,width=size,height=size,alpha=False);image.colorspace_settings.name=colorspace
 for m in materials:
  for n in m.node_tree.nodes:n.select=False
  node=m.node_tree.nodes.new('ShaderNodeTexImage');node.image=image;node.select=True;m.node_tree.nodes.active=node
 bpy.ops.object.bake(type=kind)
 image.filepath_raw=str(T/(name+'.png'));image.file_format='PNG';image.save();return image
color=bake('raha-studio-color','DIFFUSE',2048,'sRGB');print('COLOR_ATLAS_COMPLETE',flush=True)
normal=bake('raha-studio-normal','NORMAL',1024,'Non-Color');print('NORMAL_ATLAS_COMPLETE',flush=True)
rough=bake('raha-studio-roughness','ROUGHNESS',1024,'Non-Color');print('ROUGHNESS_ATLAS_COMPLETE',flush=True)
# Replace complex film shaders with one standard mobile material and two baked textures.
mat=bpy.data.materials.new('Raha - baked studio adaptation');mat.use_nodes=True;nt=mat.node_tree;bs=nt.nodes['Principled BSDF'];bs.inputs['Roughness'].default_value=.72
tex=nt.nodes.new('ShaderNodeTexImage');tex.image=color;nt.links.new(tex.outputs['Color'],bs.inputs['Base Color'])
nor=nt.nodes.new('ShaderNodeTexImage');nor.image=normal;nmap=nt.nodes.new('ShaderNodeNormalMap');nmap.inputs['Strength'].default_value=.3;nt.links.new(nor.outputs['Color'],nmap.inputs['Color']);nt.links.new(nmap.outputs['Normal'],bs.inputs['Normal'])
rtex=nt.nodes.new('ShaderNodeTexImage');rtex.image=rough;nt.links.new(rtex.outputs['Color'],bs.inputs['Roughness'])
for o in snapshots:
 o.data.materials.clear();o.data.materials.append(mat)
 for f in o.data.polygons:f.material_index=0
 # Atlas becomes the exported UV set; the painted source map stays in the source file.
 
 for name in [uv.name for uv in o.data.uv_layers]:
  if name!='BakeAtlas':o.data.uv_layers.remove(o.data.uv_layers[name])
 o.data.uv_layers[0].name='UVMap';o.data.uv_layers[0].active_render=True
# Preserve the source vertex weights, merging its many face/finger controls to game joints.
def remap(name):
 side='l'if name.endswith('.L')else'r'
 low=name.lower()
 if not name.startswith('DEF-'):return None
 if 'watch' in low:return 'hand.l'
 if 'fannypack' in low or 'fanny' in low:return 'hips'
 if any(t in low for t in ['finger','wrist','hand.']):return 'hand.'+side
 if 'forearm' in low:return 'lowerarm.'+side
 if any(t in low for t in ['upperarm','sleeve','shoulder']):return 'upperarm.'+side
 if 'thigh' in low or 'shorts.' in low:return 'upperleg.'+side
 if 'knee' in low:return 'lowerleg.'+side
 if 'toes' in low:return 'toes.'+side
 if 'foot' in low:return 'foot.'+side
 if 'hips.' in low or 'hip_center' in low:return 'hips'
 if 'spine' in low or 'belly' in low:return 'spine'
 if 'chest' in low or 'ribcage' in low or 'handkerchief' in low:return 'chest'
 return 'head'
SCALE=1.5
for o in snapshots:
 original=[g.name for g in o.vertex_groups];weights=[]
 for v in o.data.vertices:
  row={}
  for g in v.groups:
   target=remap(original[g.group])
   if target:row[target]=row.get(target,0)+g.weight
  if not row:row={'head' if 'hair' in o.name or 'head' in o.name or 'eye' in o.name else 'hips':1}
  total=sum(row.values());weights.append({n:w/total for n,w in row.items()})
 o.vertex_groups.clear();groups={n:o.vertex_groups.new(name=n)for n in sorted({n for row in weights for n in row})}
 for i,row in enumerate(weights):
  for n,w in row.items():groups[n].add([i],w,'REPLACE')
 o.data.transform(Matrix.Scale(SCALE,4),shape_keys=True)
# Fit the small runtime rig to the production mesh's actual anatomical joint locations.
source_bones={b.name:(b.head_local.copy()*SCALE,b.tail_local.copy()*SCALE)for b in source_rig.data.bones}
before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(R/'app/src/main/assets/rebuild/models/general.glb'));rig=next(o for o in bpy.data.objects if o not in before and o.type=='ARMATURE');rig.animation_data_clear()
for o in list(bpy.data.objects):
 if o not in before and o.type=='MESH':bpy.data.objects.remove(o,do_unlink=True)
bpy.ops.object.select_all(action='DESELECT');rig.select_set(True);bpy.context.view_layer.objects.active=rig;bpy.ops.object.mode_set(mode='EDIT')
mapping={'hips':('DEF-Hip_Center',0),'spine':('DEF-Spine',0),'chest':('DEF-Chest',0),'head':('DEF-Head',0)}
for side in ['l','r']:
 up=side.upper();mapping.update({'upperarm.'+side:('DEF-UpperArm1.'+up,0),'lowerarm.'+side:('DEF-Forearm1.'+up,0),'wrist.'+side:('DEF-Wrist.'+up,0),'hand.'+side:('DEF-Wrist.'+up,1),'upperleg.'+side:('DEF-Thigh1.'+up,0),'lowerleg.'+side:('DEF-Knee1.'+up,0),'foot.'+side:('DEF-Foot.'+up,0),'toes.'+side:('DEF-Toes.'+up,0)})
for b in rig.data.edit_bones:
 if b.name in mapping:
  key,end=mapping[b.name];old=b.tail-b.head;b.head=source_bones[key][end]
  # Keep its source orientation so shared clip retargeting stays stable.
  b.tail=b.head+old
bpy.ops.object.mode_set(mode='OBJECT')
# Use actual child joint positions for the skinning segment lengths.
bpy.ops.object.mode_set(mode='EDIT')
for b in rig.data.edit_bones:
 pairs={'upperarm':'lowerarm','lowerarm':'wrist','wrist':'hand','upperleg':'lowerleg','lowerleg':'foot','foot':'toes'}
 for a,c in pairs.items():
  if b.name.startswith(a+'.'):b.tail=rig.data.edit_bones[c+'.'+b.name[-1]].head
bpy.ops.object.mode_set(mode='OBJECT')
bpy.ops.object.select_all(action='DESELECT')
for o in snapshots:o.select_set(True)
bpy.context.view_layer.objects.active=snapshots[0];bpy.ops.object.join();body=bpy.context.object;body.name='Raha_StudioAdaptation';body.parent=rig;mod=body.modifiers.new('Mobile deformation','ARMATURE');mod.object=rig
body['attribution']='Ellie Pose Library © Blender Studio — CC-BY. Adapted colors, accessories, baked textures and runtime rig for Garden of Secrets.'
body['source']='https://www.blender.org/download/demo-files/#assets'
# Simple facial morphs keep the runtime interface compatible. Film facial rig is retained in original source.
assert body.data.shape_keys and all(n in body.data.shape_keys.key_blocks for n in ['Basis','Blink','Speak','Smile'])
for k in body.data.shape_keys.key_blocks:k.value=0

# Keep the exported scene isolated from the film rig and helper objects.
bpy.ops.object.select_all(action='DESELECT');body.select_set(True);rig.select_set(True);bpy.context.view_layer.objects.active=rig
# Deliver a portable editable runtime master, without the source film helpers or scripts.
keep={body,rig};ancestor=rig.parent
while ancestor:keep.add(ancestor);ancestor=ancestor.parent
for obj in list(bpy.data.objects):
 if obj not in keep:bpy.data.objects.remove(obj,do_unlink=True)
for text in list(bpy.data.texts):bpy.data.texts.remove(text)
notice=bpy.data.texts.new('Attribution - Blender Studio Ellie');notice.write((R/'app/src/main/assets/rebuild/licenses/Blender-Studio-Ellie.txt').read_text(encoding='utf8'))
for image in [color,normal,rough]:image.pack()
bpy.ops.wm.save_as_mainfile(filepath=str(A/'blender/raha-studio-mobile.blend'))
bpy.ops.export_scene.gltf(filepath=str(R/'app/src/main/assets/rebuild/models/blender/raha-studio.glb'),export_format='GLB',use_selection=True,export_animations=False,export_cameras=False,export_lights=False,export_morph_normal=False,export_extras=True)
print('STUDIO_MOBILE_EXPORT_COMPLETE',len(body.data.vertices),flush=True)

"""A Blender-only story key art render using the runtime garden and hero meshes."""
import bpy,math,random
from pathlib import Path
from mathutils import Vector
R=Path(__file__).resolve().parents[2];bpy.ops.wm.open_mainfile(filepath=str(R/'art-source/blender/raha-studio-portrait.blend'))
scene=bpy.context.scene
hero=next(o for o in bpy.data.objects if o.type=='ARMATURE');hero.location.z+=.04
for o in list(bpy.data.objects):
 if o.type in ['CAMERA','LIGHT']:bpy.data.objects.remove(o,do_unlink=True)
existing=set(bpy.data.objects)
bpy.ops.import_scene.gltf(filepath=str(R/'app/src/main/assets/rebuild/models/blender/garden.glb'))
garden=[o for o in bpy.data.objects if o not in existing];roots=[o for o in garden if o.parent not in garden]
for o in roots:o.location.y+=5
for o in garden:
 if o.name.startswith(('Upgrade_','Pickup_','Special_key')):o.hide_render=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.012,.025,.095,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.35
for p,c,e,size in [((-2,-3,4),(1,.76,.51),650,4),((3,1,4),(.22,.48,1),1100,3),((-3,4,3),(.64,.3,1),900,3)]:
 bpy.ops.object.light_add(type='AREA',location=p);o=bpy.context.object;o.data.color=c;o.data.energy=e;o.data.shape='DISK';o.data.size=size;o.rotation_euler=(Vector((0,0,1.2))-o.location).to_track_quat('-Z','Y').to_euler()
# Floating warm motes and cool garden light are authored scene elements.
m=bpy.data.materials.new('Firefly amber');m.use_nodes=True;bs=m.node_tree.nodes['Principled BSDF'];bs.inputs['Base Color'].default_value=(1,.45,.04,1);bs.inputs['Emission Color'].default_value=(1,.35,.015,1);bs.inputs['Emission Strength'].default_value=5
random.seed(15)
for i in range(32):
 x=random.uniform(-3,3);y=random.uniform(.5,7);z=random.uniform(.5,3.2)
 bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=random.uniform(.009,.023),location=(x,y,z));bpy.context.object.name='Garden firefly';bpy.context.object.data.materials.append(m)
bpy.ops.object.camera_add(location=(2.1,-6.5,2.25));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,1.23))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='PERSP';cam.data.lens=72;cam.data.dof.use_dof=True;cam.data.dof.focus_distance=(Vector((0,0,1.4))-cam.location).length;cam.data.dof.aperture_fstop=3.2;scene.camera=cam
scene.render.engine='CYCLES';scene.cycles.samples=64;scene.cycles.use_denoising=True;scene.render.resolution_x=1000;scene.render.resolution_y=1400;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.render.filepath=str(R/'art-source/renders/garden-studio-character.png')
# Keep editable scene, lighting and camera with the image.
bpy.ops.wm.save_as_mainfile(filepath=str(R/'art-source/blender/garden-studio-character.blend'));bpy.ops.render.render(write_still=True)
print('STORY_ART_RENDER_COMPLETE',flush=True)

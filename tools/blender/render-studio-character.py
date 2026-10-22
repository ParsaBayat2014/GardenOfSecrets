import bpy,math
from pathlib import Path
from mathutils import Vector,Quaternion
R=Path(__file__).resolve().parents[2];bpy.ops.wm.open_mainfile(filepath=str(R/'art-source/blender/raha-studio-mobile.blend'),use_scripts=False)
s=bpy.context.scene;s.render.use_stamp=False
if bpy.context.object and bpy.context.object.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
body=bpy.data.objects['Raha_StudioAdaptation'];body.data.shape_keys.key_blocks['Smile'].value=0;rig=body.parent;rig.animation_data_clear()
for bone in rig.pose.bones:bone.matrix_basis.identity()
for side,sign in [('l',1),('r',-1)]:
 for name,angle in [('upperarm',65),('lowerarm',12)]:
  b=rig.pose.bones[name+'.'+side];b.rotation_mode='QUATERNION';q=b.bone.matrix_local.to_quaternion();b.rotation_quaternion=q.inverted()@Quaternion((0,1,0),sign*math.radians(angle))@q
s.world=bpy.data.worlds.new('Garden portrait studio');s.world.use_nodes=True;s.world.node_tree.nodes['Background'].inputs[0].default_value=(.02,.055,.075,1);s.world.node_tree.nodes['Background'].inputs[1].default_value=.5
for pos,color,power,size in [((-3,-4,5),(1,.82,.64),500,4),((3,-1,3),(.6,.85,1),180,3),((1,3,4),(.24,.55,1),600,3)]:
 bpy.ops.object.light_add(type='AREA',location=pos);o=bpy.context.object;o.data.color=color;o.data.energy=power;o.data.size=size;o.rotation_euler=(Vector((0,0,1.4))-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(1.2,-5,1.9));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,1.6))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=1.02;s.camera=cam
s.render.engine='CYCLES';s.cycles.samples=48;s.cycles.use_denoising=True;s.render.resolution_x=1000;s.render.resolution_y=1100;s.render.resolution_percentage=100;s.view_settings.view_transform='AgX';s.render.image_settings.media_type='IMAGE';s.render.image_settings.file_format='PNG';s.render.filepath=str(R/'art-source/renders/raha-studio-closeup.png');bpy.ops.render.render(write_still=True)
cam.location=(1.3,-5,1.7);cam.rotation_euler=(Vector((0,0,1.05))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=2.35;s.render.filepath=str(R/'art-source/renders/raha-studio-full.png');bpy.ops.render.render(write_still=True)
readme=bpy.data.texts.get('Attribution - Blender Studio Ellie')
assert readme,'Missing source attribution'
bpy.ops.wm.save_as_mainfile(filepath=str(R/'art-source/blender/raha-studio-portrait.blend'));print('ADAPTED_STUDIO_PORTRAIT_COMPLETE',flush=True)

"""Original Blender lofted characters: tailored bodies, sculpted faces and swept hair."""
import bpy,math,sys
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2];SRC=ROOT/'art-source/blender';OUT=ROOT/'app/src/main/assets/rebuild/models/blender';RENDERS=ROOT/'art-source/renders'
def mat(name,c,rough=.6):
 m=bpy.data.materials.new(name);m.diffuse_color=(*[(((c>>s)&255)/255)**2.2 for s in [16,8,0]],1);m.use_nodes=True;b=m.node_tree.nodes['Principled BSDF'];b.inputs['Base Color'].default_value=m.diffuse_color;b.inputs['Roughness'].default_value=rough;return m
def bind(o,bone,m):
 bpy.context.view_layer.update()
 o.data.materials.append(m)
 for f in o.data.polygons:f.use_smooth=True
 o.matrix_world=arm.matrix_world@arm.data.bones[bone].matrix_local@o.matrix_world
 bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
 
 if o.name.split('.')[0] in ['Eye globe','Iris','Pupil','Catchlight','Upper eyelid','Lower eyelid','Lash line','Lower smile lip']:
  tag=o.vertex_groups.new(name='detail_'+o.name.split('.')[0]);tag.add(list(range(len(o.data.vertices))),1,'REPLACE')
 g=o.vertex_groups.new(name=bone);g.add(list(range(len(o.data.vertices))),1,'REPLACE')
 if bone=='spine':
  upper=o.vertex_groups.new(name='chest')
  for v in o.data.vertices:
   w=max(0,min(1,(v.co.z-.88)/.22))
   if w:g.add([v.index],1-w,'REPLACE');upper.add([v.index],w,'REPLACE')
 parts.append(o);return o
def mesh(name,bone,vs,fs,m):
 d=bpy.data.meshes.new(name);d.from_pydata(vs,[],fs);d.validate();d.update();o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);return bind(o,bone,m)
def loft(name,bone,rings,m,n=32):
 vs=[];fs=[]
 for y,w,d,z,x in rings:
  for i in range(n):a=i*math.tau/n;vs.append((x+math.cos(a)*w,y,z+math.sin(a)*d))
 for j in range(len(rings)-1):
  for i in range(n):a=j*n+i;b=j*n+(i+1)%n;fs.append((a,b,b+n,a+n))
 fs.extend([tuple(range(n-1,-1,-1)),tuple((len(rings)-1)*n+i for i in range(n))]);return mesh(name,bone,vs,fs,m)
def ell(name,bone,p,size,m):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,location=p);o=bpy.context.object;o.name=name;o.scale=size;return bind(o,bone,m)
def stroke(name,bone,points,r,m,depth=1):
 vs=[];fs=[];n=8
 for i,p in enumerate(points):
  t=Vector(points[min(i+1,len(points)-1)])-Vector(points[max(0,i-1)]);t.normalize();u=t.cross(Vector((0,0,1)))
  if u.length<.01:u=t.cross(Vector((1,0,0)))
  u.normalize();v=t.cross(u).normalized();rr=r*(.4 if i in [0,len(points)-1]else 1)
  for j in range(n):a=j*math.tau/n;vs.append(tuple(Vector(p)+u*math.cos(a)*rr+v*math.sin(a)*rr*depth))
 for i in range(len(points)-1):
  for j in range(n):a=i*n+j;b=i*n+(j+1)%n;fs.append((a,b,b+n,a+n))
 return mesh(name,bone,vs,fs,m)
def patch(name,bone,outline,m):
 n=len(outline);vs=outline+[(x,y,z-.012)for x,y,z in outline];fs=[tuple(range(n)),tuple(range(2*n-1,n-1,-1))]+[(i,(i+1)%n,(i+1)%n+n,i+n)for i in range(n)]
 o=mesh(name,bone,vs,fs,m);mod=o.modifiers.new('Tailored edges','BEVEL');mod.width=.005;mod.segments=2;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name);return o
def build(ident):
 global arm,parts
 bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=str(ROOT/'app/src/main/assets/rebuild/models/general.glb'));arm=next(o for o in bpy.data.objects if o.type=='ARMATURE');arm.animation_data_clear();arm.data.pose_position='REST';parts=[]
 for o in list(bpy.data.objects):
  if o.type=='MESH':bpy.data.objects.remove(o,do_unlink=True)
 colors={'raha':(0xB34E38,0x254F51,0x30221D),'sohrab':(0x687450,0x68513E,0xD5C7AC),'saman':(0x497A89,0x665C4D,0x322622)}[ident]
 skin=mat('Warm skin',0xDDA57E if ident=='raha'else 0xC99470,.74);coat=mat('Woven outerwear',colors[0]);trouser=mat('Tailored trousers',colors[1]);hair=mat('Sculpted hair',colors[2]);ivory=mat('Linen',0xF0DDAD);leather=mat('Leather',0x6C4530);brass=mat('Brass',0xD8AC56,.35);white=mat('Eye whites',0xFFF3D9,.3);iris=mat('Hazel iris',0x687747,.3);pupil=mat('Pupil',0x211C18,.25);lip=mat('Terracotta lips',0xA65F50)
 loft('Fitted jacket torso','spine',[(-.05,.19,.12,0,0),(0,.195,.125,0,0),(.10,.17,.115,0,0),(.23,.205,.13,0,0),(.34,.22,.13,0,0),(.43,.24,.125,0,0),(.50,.22,.115,0,0),(.55,.15,.09,0,0),(.60,.075,.07,0,0)],coat)
 loft('Neck','head',[(-.11,.07,.065,0,0),(-.035,.073,.069,0,0),(.025,.085,.075,0,0)],skin)
 loft('Waistband','hips',[(-.06,.17,.115,0,0),(.025,.195,.125,0,0),(.12,.19,.12,0,0)],trouser)
 loft('Leather belt','spine',[(-.02,.196,.13,0,0),(.013,.195,.13,0,0)],leather)
 patch('Belt buckle','spine',[(-.035,-.023,.142),(.035,-.023,.142),(.035,.016,.142),(-.035,.016,.142)],brass)
 patch('Linen shirt inset','spine',[(-.07,.035,.127),(.07,.035,.127),(.075,.55,.10),(-.075,.55,.10)],ivory)
 for s in [-1,1]:
  patch('Folded lapel','spine',[(s*.015,.27,.15),(s*.078,.12,.15),(s*.16,.48,.135),(s*.095,.56,.10)],coat)
  patch('Collar fold','chest',[(s*.01,.215,.07),(s*.075,.23,.07),(s*.12,.15,.11),(s*.06,.12,.12)],ivory)
  patch('Flapped pocket','spine',[(s*.10,.015,.131),(s*.173,.025,.12),(s*.173,.105,.13),(s*.10,.105,.143)],coat)
  stroke('Pocket stitching','spine',[(s*.105,.095,.148),(s*.135,.092,.145),(s*.17,.10,.137)],.003,ivory)
 for y in [.09,.17,.25]:ell('Button','spine',(.09,y,.145),(.009,.009,.006),brass)
 for s in ['l','r']:
  loft('Upper tailored sleeve','upperarm.'+s,[(-.025,.075,.075,0,0),(.03,.093,.09,0,0),(.10,.081,.081,0,0),(.19,.066,.066,0,0),(.25,.065,.065,0,0)],coat,24)
  ell('Clothed elbow joint','lowerarm.'+s,(0,0,0),(.066,.066,.064),coat)
  loft('Rolled forearm sleeve','lowerarm.'+s,[(-.02,.066,.064,0,0),(.06,.064,.065,0,0),(.14,.057,.055,0,0),(.20,.052,.052,0,0)],coat,24)
  loft('Contrast cuff','lowerarm.'+s,[(.17,.059,.058,0,0),(.205,.059,.058,0,0)],ivory,24)
  loft('Wrist','lowerarm.'+s,[(.195,.043,.042,0,0),(.28,.04,.038,0,0),(.35,.038,.035,0,0)],skin,20)
  loft('Palm','hand.'+s,[(-.01,.036,.027,0,0),(.025,.049,.032,0,0),(.075,.045,.029,0,0),(.09,.035,.024,0,0)],skin,20)
  for i in range(4):
   x=-.032+i*.021;end=.15-abs(i-1)*.009;stroke('Individual finger','hand.'+s,[(x,.06,0),(x,.10,.006),(x,end,.016),(x,end+.008,.02)],.012,skin)
  stroke('Thumb','hand.'+s,[(.039,.025,0),(.065,.055,.015),(.067,.09,.025)],.018,skin)
  loft('Trouser thigh','upperleg.'+s,[(-.035,.105,.108,0,0),(.05,.10,.102,0,0),(.14,.087,.09,0,0),(.23,.075,.078,0,0)],trouser,24)
  ell('Clothed knee joint','lowerleg.'+s,(0,0,0),(.078,.07,.078),trouser)
  loft('Trouser calf','lowerleg.'+s,[(-.02,.077,.08,0,0),(.055,.08,.074,0,0),(.14,.065,.065,0,0),(.19,.06,.06,0,0)],trouser,24)
  loft('Boot ankle','lowerleg.'+s,[(.11,.069,.065,0,0),(.19,.072,.069,0,0),(.23,.072,.07,0,0)],leather,24)
  loft('Shaped leather boot','foot.'+s,[(-.035,.067,.07,0,0),(.01,.085,.075,0,0),(.12,.093,.064,.01,0),(.21,.085,.054,.018,0),(.25,.035,.035,.018,0)],leather,24)
 # One continuous face silhouette: chin, jaw, cheeks, temples and cranium.
 loft('Sculpted face','head',[(-.035,.055,.065,.025,0),(-.01,.09,.085,.025,0),(.035,.124,.105,.015,0),(.09,.157,.127,.006,0),(.15,.172,.14,0,0),(.21,.164,.139,-.005,0),(.28,.152,.13,-.012,0),(.34,.12,.105,-.02,0),(.375,.065,.06,-.02,0),(.385,.008,.01,-.02,0)],skin,48)
 for s in [-1,1]:
  ell('Ear shell','head',(s*.167,.145,0),(.025,.048,.027),skin)
  stroke('Ear fold','head',[(s*.177,.12,.019),(s*.182,.15,.026),(s*.174,.177,.018)],.007,lip)
  ell('Eye globe','head',(s*.071,.195,.121),(.048,.033,.028),white)
  ell('Iris','head',(s*.068,.194,.146),(.021,.023,.009),iris)
  ell('Pupil','head',(s*.068,.195,.153),(.010,.014,.005),pupil)
  ell('Catchlight','head',(s*.061,.204,.158),(.005,.006,.002),white)
  stroke('Upper eyelid','head',[(s*.026,.196,.141),(s*.05,.22,.146),(s*.084,.224,.144),(s*.117,.199,.13)],.009,skin)
  stroke('Lash line','head',[(s*.029,.199,.151),(s*.053,.218,.155),(s*.085,.22,.15),(s*.113,.201,.139)],.0035,hair)
  stroke('Lower eyelid','head',[(s*.027,.19,.144),(s*.062,.174,.15),(s*.092,.178,.145),(s*.113,.197,.134)],.006,skin)
  stroke('Eyebrow','head',[(s*.027,.254,.13),(s*.057,.265,.137),(s*.09,.262,.13),(s*.12,.247,.113)],.009,hair)
 loft('Nose bridge and tip','head',[(.10,.014,.012,.146,0),(.12,.031,.024,.155,0),(.137,.031,.035,.162,0),(.155,.018,.028,.153,0),(.21,.012,.012,.135,0)],skin,20)
 stroke('Upper lip','head',[(-.052,.068,.121),(-.025,.075,.14),(0,.071,.146),(.025,.075,.14),(.052,.068,.121)],.009,lip,.55)
 stroke('Lower smile lip','head',[(-.05,.066,.125),(-.025,.055,.14),(0,.052,.147),(.025,.055,.14),(.05,.066,.125)],.008,lip,.65)
 stroke('Smile line','head',[(-.046,.067,.135),(0,.064,.151),(.046,.067,.135)],.0025,pupil)
 vs=[];fs=[];n=48;rows=10
 for j in range(rows):
  for i in range(n):
   a=i*math.tau/n;front=max(0,math.sin(a));theta=.02+j/(rows-1)*(1.75-.65*front);vs.append((.179*math.sin(theta)*math.cos(a),.19+.209*math.cos(theta),-.022+.153*math.sin(theta)*math.sin(a)))
 for j in range(rows-1):
  for i in range(n):a=j*n+i;b=j*n+(i+1)%n;fs.append((a,b,b+n,a+n))
 mesh('Shaped hair cap','head',vs,fs,hair)
 for i in range(6):
  x=-.12+i*.045;stroke('Swept fringe','head',[(x+.055,.36,.075),(x+.02,.337,.127),(x-.04,.30,.143),(x-.08,.255,.115)],.031,hair,.45)
 if ident=='raha':
  for s in [-1,1]:stroke('Temple hair lock','head',[(s*.13,.3,.075),(s*.172,.22,.045),(s*.17,.10,-.015),(s*.145,.035,-.035)],.027,hair,1.35)
  for i in range(12):
   y=.14-i*.032;x=-.16+math.sin(i*math.pi*.7)*.018;stroke('Interwoven braid','head',[(x-.018,y+.022,-.095),(x+.02,y,-.07),(x-.01,y-.023,-.085)],.024-i*.001,hair,1.3)
  patch('Satchel flap','hips',[(-.34,-.11,.045),(-.19,-.11,.075),(-.19,.06,.075),(-.34,.06,.045)],leather)
  stroke('Bag strap','spine',[(.19,.34,.14),(.09,.23,.17),(-.05,.10,.16),(-.22,-.04,.12)],.018,leather,.4)
 elif ident=='sohrab':
  for s in [-1,1]:stroke('Sculpted moustache','head',[(0,.10,.17),(s*.025,.103,.17),(s*.053,.095,.16),(s*.07,.081,.139)],.018,hair,.5)
  loft('Hat crown','head',[(.37,.18,.15,-.02,0),(.40,.175,.145,-.02,0),(.50,.15,.13,-.02,0),(.52,.13,.11,-.02,0)],ivory,40)
  loft('Hat ribbon','head',[(.38,.18,.15,-.02,0),(.41,.177,.149,-.02,0)],coat,40)
  loft('Curved hat brim','head',[(.365,.19,.16,-.02,0),(.36,.27,.23,-.02,0),(.37,.27,.23,-.02,0),(.38,.19,.16,-.02,0)],ivory,48)
 else:
  for s in [-1,1]:stroke('Eyeglass frame','head',[(s*.071+math.cos(i*math.tau/24)*.055,.195+math.sin(i*math.tau/24)*.041,.159)for i in range(25)],.005,leather)
  stroke('Eyeglass bridge','head',[(-.017,.20,.158),(0,.207,.165),(.017,.20,.158)],.004,leather)
 bpy.ops.object.select_all(action='DESELECT')
 for o in parts:o.select_set(True)
 bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join();body=bpy.context.object;body.name=ident+'_TailoredCharacter';body.parent=arm;mod=body.modifiers.new('Character deformation','ARMATURE');mod.object=arm;arm.data.pose_position='POSE'
 body.data.validate()
 basis=body.shape_key_add(name='Basis');blink=body.shape_key_add(name='Blink');speak=body.shape_key_add(name='Speak')
 for vertex in body.data.vertices:
  tags={body.vertex_groups[g.group].name for g in vertex.groups}
  if tags.intersection({'detail_Eye globe','detail_Iris','detail_Pupil','detail_Catchlight'}):blink.data[vertex.index].co.z=1.436+(vertex.co.z-1.436)*.12
  if tags.intersection({'detail_Upper eyelid','detail_Lash line'}):blink.data[vertex.index].co.z-=.023
  if 'detail_Lower eyelid' in tags:blink.data[vertex.index].co.z+=.012
  if 'detail_Lower smile lip' in tags:speak.data[vertex.index].co.z-=.012
 bpy.ops.wm.save_as_mainfile(filepath=str(SRC/f'{ident}-master.blend'))
 bpy.ops.export_scene.gltf(filepath=str(OUT/f'{ident}.glb'),export_format='GLB',export_animations=False,export_cameras=False,export_lights=False)
 action=bpy.data.actions.get('Idle_A')
 if action:
  arm.animation_data_create();arm.animation_data.action=action
  if action.slots:arm.animation_data.action_slot=action.slots[0]
  bpy.context.scene.frame_set(12)
 scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True;scene.render.resolution_x=900;scene.render.resolution_y=1100;scene.render.resolution_percentage=100
 scene.world=bpy.data.worlds.new('Portrait studio');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.14,.20,.19,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.55
 for pos,power,size in [((-3,-4,5),450,4),((3,-1,3),250,3),((0,3,4),600,3)]:
  bpy.ops.object.light_add(type='AREA',location=pos);o=bpy.context.object;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.rotation_euler=(Vector((0,0,1))-o.location).to_track_quat('-Z','Y').to_euler()
 bpy.ops.object.camera_add(location=(2.1,-6,2.2));camera=bpy.context.object;camera.rotation_euler=(Vector((0,0,.96))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=2.15;scene.camera=camera;scene.view_settings.view_transform='AgX';scene.render.image_settings.file_format='PNG';scene.render.filepath=str(RENDERS/f'{ident}-character.png');bpy.ops.render.render(write_still=True)
 print('TAILORED_CHARACTER_COMPLETE',ident,flush=True)
for ident in (sys.argv[sys.argv.index('--')+1:]if'--'in sys.argv else ['raha','sohrab','saman']):build(ident)

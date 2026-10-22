"""Blender authoring pass: original garden architecture, plants and room props.
Run with Blender 5: --background --python this_file.py -- [garden|shed|green|archive|all]
The blockouts preserve tested interaction coordinates; all final meshes export from Blender.
"""
import bpy,math,random,sys,json
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/'art-source/blender'
DEST=ROOT/'app/src/main/assets/rebuild/models/blender'
RENDERS=ROOT/'art-source/renders'
for p in [SOURCE,DEST,RENDERS]:p.mkdir(parents=True,exist_ok=True)
random.seed(21)
def xyz(p):return (p[0],-p[2],p[1])
def material(name,hexcolor,rough=.65,metal=0):
 m=bpy.data.materials.get(name)
 if m:return m
 m=bpy.data.materials.new(name);m.diffuse_color=(*hexcolor,1);m.use_nodes=True
 bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*hexcolor,1);bs.inputs['Roughness'].default_value=rough;bs.inputs['Metallic'].default_value=metal
 return m
def col(name,value,rough=.65,metal=0):return material(name,tuple(((value>>s)&255)/255 for s in [16,8,0]),rough,metal)
def finish(ob,mat,name):
 ob.name=name;ob.data.materials.clear();ob.data.materials.append(mat);return ob
def box(name,p,size,mat,bevel=.025):
 bpy.ops.mesh.primitive_cube_add(size=1,location=xyz(p));o=bpy.context.object;o.dimensions=(size[0],size[2],size[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);finish(o,mat,name)
 if bevel:
  mod=o.modifiers.new('Soft hand-crafted edges','BEVEL');mod.width=min(bevel,min(size)*.22);mod.segments=2
  n=o.modifiers.new('Weighted corner normals','WEIGHTED_NORMAL');n.keep_sharp=True
 return o
def ball(name,p,size,mat):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=8,location=xyz(p));o=bpy.context.object;o.scale=(size[0],size[2],size[1]);finish(o,mat,name)
 for f in o.data.polygons:f.use_smooth=True
 return o
def cylinder(name,p,radius,depth,mat,vertices=24):
 bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=radius,depth=depth,location=xyz(p));o=finish(bpy.context.object,mat,name)
 mod=o.modifiers.new('Rim bevel','BEVEL');mod.width=min(.025,depth*.12);mod.segments=2
 o.modifiers.new('Rim normals','WEIGHTED_NORMAL');return o
def curve(name,points,radius,mat):
 data=bpy.data.curves.new(name,'CURVE');data.dimensions='3D';data.resolution_u=8;data.bevel_depth=radius;data.bevel_resolution=2;s=data.splines.new('BEZIER');s.bezier_points.add(len(points)-1)
 for point,co in zip(s.bezier_points,points):point.co=xyz(co);point.handle_left_type=point.handle_right_type='AUTO'
 o=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(o);o.data.materials.append(mat);return o
def lathe(name,p,profile,mat,segments=32):
 vertices=[];faces=[]
 for y,r in profile:
  for i in range(segments):a=i*math.tau/segments;vertices.append(xyz((p[0]+math.cos(a)*r,p[1]+y,p[2]+math.sin(a)*r)))
 for row in range(len(profile)-1):
  for i in range(segments):a=row*segments+i;b=row*segments+(i+1)%segments;faces.append((a,b,b+segments,a+segments))
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(vertices,[],faces);mesh.update();o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o);o.data.materials.append(mat)
 for f in mesh.polygons:f.use_smooth=True
 return o
def rose(x,y,z,size=1,pink=None):
 petal=pink or col('Rose coral',0xe8878b,.73);leaf=col('Rose leaves',0x39734d);stem=col('Flower stems',0x416c43)
 curve('Rose stem',[(x,y-.3*size,z),(x+.025*size,y-.12*size,z),(x,y,z)],.015*size,stem)
 for layer in range(3):
  count=5 if layer<2 else 3;r=(.095-layer*.025)*size
  for j in range(count):
   a=j*math.tau/count+layer*.6;o=ball('Curved rose petal',(x+math.cos(a)*r,y+layer*.022*size,z+math.sin(a)*r),((.085-layer*.016)*size,.03*size,(.07-layer*.01)*size),petal);o.rotation_euler.z=a
 for side in [-1,1]:
  o=ball('Tapered rose leaf',(x+side*.08*size,y-.17*size,z),(.1*size,.018*size,.045*size),leaf);o.rotation_euler.y=side*.4
def vine(x,y,z,length,seed):
 rng=random.Random(seed);stem=col('Climbing vine wood',0x54704a);leaf=[col('Vine sage',0x719855),col('Vine deep',0x3f7751),col('Vine lime',0x8daa62)]
 points=[(x+math.sin(i*.7)*.15,y+i*length/8,z)for i in range(9)];curve('Climbing vine',points,.025,stem)
 for i in range(28):
  t=i/28;xx=x+math.sin(t*6)*.15;yy=y+t*length;side=(-1)**i;o=ball('Ivy leaf',(xx+side*(.12+rng.random()*.13),yy,z-.02),(.15,.075,.12),leaf[i%3]);o.rotation_euler.y=side*.65
def mosaic(x,y,z,w,h):
 ivory=col('Mosaic ivory',0xf6e5b9);blue=col('Mosaic turquoise',0x278f95);deep=col('Mosaic cobalt',0x306d7d)
 for row in range(h):
  for i in range(w):
   o=box('Hand set mosaic',(x+(i-w/2)*.145,y+row*.145,z),(.10,.10,.028),[ivory,blue,deep][(i+row)%3],.008);o.rotation_euler.y=math.pi/4
def arch_trim(x,y,z,width,height):
 mat=col('Arch limestone',0xf1dcb2);accent=col('Arch glazed turquoise',0x2b8b8b,.4)
 for side in [-1,1]:box('Arch side pilaster',(x+side*(width/2+.09),y+(height-width/2)/2,z),(.12,height-width/2,.20),mat)
 center=y+height-width/2
 for i in range(20):
  a=i*math.pi/19;px=x+math.cos(a)*(width/2+.09);py=center+math.sin(a)*(width/2+.09);o=box('Arch voussoir',(px,py,z),(.17,.19,.23),accent if i%4==0 else mat,.018);o.rotation_euler.y=math.pi/2-a
def roof_tiles(x,z,w,d,y):
 terracotta=[col('Roof coral '+str(i),c,.8)for i,c in enumerate([0xc47856,0xb96b4f,0xd58c61])]
 for i in range(int(w/.35)):
  for j in range(int(d/.55)):
   xx=x-w/2+.18+i*.35;zz=z-d/2+.28+j*.55
   # Curved barrel tile, with a raised overlap at the end of each row.
   vertices=[];faces=[]
   for zzoff in [-.31,.31]:
    for k in range(9):a=k*math.pi/8;vertices.append(xyz((xx+math.cos(a)*.165,y+math.sin(a)*.09,zz+zzoff)))
   for k in range(8):faces.append((k,k+1,k+10,k+9))
   me=bpy.data.meshes.new('Barrel tile');me.from_pydata(vertices,[],faces);me.update();o=bpy.data.objects.new('Hand shaped terracotta roof',me);bpy.context.collection.objects.link(o);o.data.materials.append(terracotta[(i+j)%3])
def wall_lantern(x,y,z):
 bronze=col('Lantern bronze',0x826143,.36,.5);glow=col('Lantern warm glass',0xffd693,.28)
 box('Lantern backing',(x,y,z),(.20,.55,.10),bronze)
 box('Warm lantern',(x,y,z+.15),(.24,.40,.24),glow,.035)
 for dx in [-.13,.13]:box('Lantern frame',(x+dx,y,z+.25),(.026,.43,.025),bronze,.005)
 curve('Lantern curled hook',[(x,y+.26,z),(x,y+.43,z+.13),(x,y+.28,z+.23)],.02,bronze)
def enrich_garden():
 cream=col('Carved cream stone',0xf1ddb4);teal=col('Glazed tile',0x2b8a8b,.38);gold=col('Antique brass',0xc89b50,.35,.6);wood=col('Warm cedar',0x946443)
 arch_trim(3.6,.25,-6.05,1.72,2.8)
 for x in [.9,6.2]:arch_trim(x,1.65,-6.03,1.05,1.8);mosaic(x-.35,1.25,-5.91,5,2)
 for y in [.8,3.5,4.25]:box('Villa carved horizontal moulding',(3.5,y,-6.16),(7.45,.09,.18),cream)
 for i in range(16):box('Cornice brackets',(-.1+i*.48,4.28,-6.08),(.17,.27,.22),cream)
 roof_tiles(3.5,-8,8.7,4.1,4.85);roof_tiles(-6,-4.8,4.5,3.1,3.06)
 for x,z in [[-7.8,-3.1],[-4.2,-3.1],[-.3,-6.0],[7.1,-6.0]]:vine(x,.25,z,2.6,int(x*11+z*3))
 for x in [2.3,4.9]:wall_lantern(x,2.3,-6)
 arch_trim(-6,.25,-3.32,1.35,2.25)
 for x in [-7.6,-4.4]:box('Shed shutter detail',(x,1.65,-3.35),(.65,1,.08),wood)
 # The fountain is dressed with turned stone, gilded rims and a radial floor mosaic.
 lathe('Turned fountain pedestal',(0,.12,.3),[(0,.53),(.10,.65),(.20,.51),(.40,.30),(.64,.25),(.70,.37),(.76,.38)],cream)
 for i in range(72):
  a=i*math.tau/72;r=2.35;o=box('Fountain radial mosaic',(math.cos(a)*r,.13,.3+math.sin(a)*r),(.13,.045,.27),[teal,cream,gold][i%3],.008);o.rotation_euler.z=-a
 for x in [-4.4,4.4]:
  lathe('Fluted garden urn',(x,.12,6.7),[(0,.26),(.12,.25),(.20,.39),(.65,.47),(.80,.40),(.86,.48),(.91,.48),(.93,.37)],col('Urn terracotta',0xc18459))
  for j in range(9):a=j*2.4;rose(x+math.cos(a)*.26,1.15+random.random()*.25,6.7+math.sin(a)*.26,.8)
 for j in range(16):
  x=-8.2+j*.53;z=7.2+math.sin(j*.6)*.23;rose(x,.66+random.random()*.16,z,1.0,col('Apricot roses',0xf3b494))
 for x in [-8.4,8.4]:
  for z in [4.2,0,-4]:
   curve('Curving flower border',[(x,.3,z-.8),(x+.15,.35,z),(x,.3,z+.8)],.08,col('Border limestone',0xd6bd8d))
 # Slender pergola over the left path, with climbing leaves and a hanging light.
 for z in [1.2,2.4,3.6]:box('Glasshouse roof rib',(-8,3.3,z),(3.55,.07,.07),teal)
 for i in range(8):
  x=-9.4+i*.40;curve('Glasshouse curved roof',[(x,3.1,-.8),(x,3.65,1.3),(x,3.1,3.4)],.035,teal)
 for x in [4.6,6.3]:wall_lantern(x,.98,5.28)
def book(x,y,z,w=.18,h=.36,c=None):
 cover=c or col('Book moss',0x74805a);box('Book cover',(x,y+h/2,z),(w,h,.28),cover,.012);box('Book pages',(x,y+h/2,z-.145),(w*.75,h*.91,.012),col('Aged paper',0xe8dbb2),.004);box('Book spine gold',(x,y+h*.6,z+.145),(w*.7,.025,.012),col('Book gilt',0xc5a45a),.003)
def enrich_room(name):
 brass=col('Aged brass',0xb99252,.38,.5);wood=col('Cabinet walnut',0x805338);paper=col('Aged paper',0xefe0b6);cream=col('Carved cream stone',0xf1ddb4)
 for x in [-4,0,4]:arch_trim(x,1.4,-4.94,1.6,2);box('Window sill',(x,1.4,-4.85),(1.85,.12,.45),cream)
 for z in [-3,-1,1,3]:box('Left wall wood panel',(-6.21,1.2,z),(.06,2.3,1.8),col('Muted wall panels',0xbbad86),.015)
 for x in [-5.8,5.8]:box('Room corner post',(x,1.95,-4.9),(.16,3.8,.19),wood)
 if name=='shed':
  box('Tool rack',(-2,2.6,-4.85),(4.8,.9,.12),wood)
  for i in range(7):
   x=-4+i*.58;cylinder('Hook screw',(x,2.7,-4.73),.035,.08,brass,12);curve('Hanging tool handle',[(x,2.65,-4.7),(x,2.0,-4.67)],.035,wood);box('Tool steel head',(x,1.98,-4.64),(.22,.13,.10),col('Tool steel',0x8d9a92,.35,.4))
  lathe('Garden watering bucket',(4.4,.1,2.5),[(0,.30),(.05,.33),(.65,.42),(.70,.45),(.75,.44)],col('Zinc bucket',0x6a9691,.45,.25))
  curve('Bucket curved handle',[(4.0,.65,2.5),(4.4,1.15,2.5),(4.8,.65,2.5)],.025,brass)
  for i in range(4):book(1.7+i*.22,1.2,-2,.17,.28,[col('Ledger blue',0x467f88),col('Ledger olive',0x82915d)][i%2])
  for x in [-3.5,-2.5]:box('Toolbox brass clasp',(x,1.5,-1.65),(.09,.18,.025),brass,.01)
 elif name=='green':
  for j in range(15):
   x=-4.6+j*.65;z=-3.5+math.sin(j)*.18;rose(x,1.4+random.random()*.45,z,1.2,[col('Glasshouse pink',0xec97a5),col('Glasshouse ivory',0xf4deb5)][j%2])
  for j in range(6):vine(-5.8,.5,-4+j*1.5,2.7,j)
  for x in [-3,-1]:lathe('Glazed worktable pot',(x,1.18,.4),[(0,.16),(.1,.20),(.3,.24),(.35,.25)],col('Sage ceramic',0x82a17a,.35))
  for x in [1,3,5]:box('Greenhouse tile detail',(x,.15,-1.8),(.9,.08,.9),col('Greenhouse patterned stone',0x94b5a1),.02)
  wall_lantern(3.4,2.9,-4.9)
 else:
  # A geometric Persian rug, modelled rather than painted on a flat photo.
  box('Woven rug base',(0,.10,1.3),(5.6,.025,3.9),col('Rug terracotta',0xaa6952),.018)
  for side in [-1,1]:box('Rug woven border',(side*2.5,.12,1.3),(.15,.02,3.6),col('Rug gold',0xd3b376),.0)
  for i in range(7):
   for j in range(4):o=box('Rug diamond',(-2.1+i*.7,.13,.25+j*.7),(.25,.012,.25),[col('Rug teal',0x3a7c7c),col('Rug ivory',0xe4d4a5)][(i+j)%2],.0);o.rotation_euler.z=math.pi/4
  for x in [-2.6,2.6]:
   for j in range(8):book(x+j*.16,.35,-4.65,.13,.36,[col('Library ink',0x526b73),col('Library red',0x98604e),col('Library moss',0x71835c)][j%3])
  cylinder('Desk wax seal',(.9,1.3,-.9),.09,.08,col('Sealing wax',0x9f4e43))
  curve('Desk pen',[(.25,1.23,-.8),(.55,1.25,-1.2)],.018,brass)
  for x in [-4.36,-3.64]:box('Clock carved column',(x,1.75,-2.58),(.08,2.75,.10),brass,.015)
  wall_lantern(-2.5,2.8,-4.9);wall_lantern(2.5,2.8,-4.9)
def dynamic(ob):
 while ob:
  if ob.name.startswith(('Door_','Pickup_','Special_','Upgrade_')):return True
  ob=ob.parent
 return False
def prepare_and_join():
 # Convert curves, apply bevels, then merge static geometry by material to reduce mobile draw calls.
 for ob in list(bpy.data.objects):
  if ob.type=='CURVE':bpy.ops.object.select_all(action='DESELECT');bpy.context.view_layer.objects.active=ob;ob.select_set(True);bpy.ops.object.convert(target='MESH');ob.select_set(False)
 for ob in list(bpy.data.objects):
  if ob.type!='MESH':continue
  if ob.get('primitive')=='BoxGeometry' and len(ob.data.polygons)<=12:
   bpy.ops.object.select_all(action='DESELECT');ob.data=ob.data.copy();bpy.context.view_layer.objects.active=ob;ob.select_set(True);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);mod=ob.modifiers.new('Blender bevel pass','BEVEL');mod.width=min(.035,min(ob.dimensions)*.14);mod.segments=2;ob.modifiers.new('Weighted normals','WEIGHTED_NORMAL');ob.select_set(False)
  bpy.context.view_layer.objects.active=ob
  for modifier in list(ob.modifiers):
   try:bpy.ops.object.modifier_apply(modifier=modifier.name)
   except RuntimeError:pass
 buckets={}
 for ob in list(bpy.data.objects):
  if ob.type=='MESH' and not dynamic(ob) and len(ob.data.materials)==1:buckets.setdefault(ob.data.materials[0].name,[]).append(ob)
 bpy.ops.object.select_all(action='DESELECT')
 for name,objects in buckets.items():
  for ob in objects:ob.select_set(True)
  bpy.context.view_layer.objects.active=objects[0]
  if len(objects)>1:bpy.ops.object.join()
  bpy.context.object.name='Art_'+name
  bpy.ops.object.select_all(action='DESELECT')
def setup_render(name):
 scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True;scene.render.resolution_x=1200;scene.render.resolution_y=800;scene.render.resolution_percentage=100
 scene.world=bpy.data.worlds.new('Warm open sky');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.65,.79,.74,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.65
 bpy.ops.object.light_add(type='AREA',location=(-6,-8,15));bpy.context.object.name='Large softbox sun';bpy.context.object.data.energy=1800;bpy.context.object.data.shape='DISK';bpy.context.object.data.size=8;bpy.context.object.rotation_euler=(math.radians(25),0,math.radians(-30))
 bpy.ops.object.camera_add(location=(18,-25,20) if name=='garden' else (11,-17,12));camera=bpy.context.object;target=Vector((0,0,1));camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=27 if name=='garden'else 17;scene.camera=camera;scene.view_settings.view_transform='AgX';scene.render.image_settings.file_format='PNG';scene.render.filepath=str(RENDERS/(name+'-blender.png'))
def build(name):
 bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=str(SOURCE/'blockouts'/f'{name}.glb'))
 for m in bpy.data.materials:
  if m.use_nodes:
   bs=m.node_tree.nodes.get('Principled BSDF')
   if bs:bs.inputs['Roughness'].default_value=.68
 if name=='garden':enrich_garden()
 else:enrich_room(name)
 prepare_and_join();setup_render(name)
 bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE/(name+'-master.blend')))
 bpy.ops.export_scene.gltf(filepath=str(DEST/(name+'.glb')),export_format='GLB',export_cameras=False,export_lights=False,export_animations=False,export_extras=True)
 bpy.ops.render.render(write_still=True)
 print('BLENDER_ENVIRONMENT_COMPLETE',name,len(bpy.data.objects),flush=True)
mode=sys.argv[sys.argv.index('--')+1]if'--'in sys.argv else'all'
for name in (['garden','shed','green','archive']if mode=='all'else[mode]):build(name)

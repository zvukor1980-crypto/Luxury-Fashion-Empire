# Run with Blender 4.5 --background --python scripts/build_models.py -- <mpfb-source> <system-assets>
# Uses only CC0 MakeHuman assets; MPFB tool itself is GPL and is not shipped in the game.
import bpy, sys, os, math
from mathutils import Vector, Quaternion
args=sys.argv[sys.argv.index('--')+1:]
sys.path.insert(0, os.path.join(args[0],'src'))
import mpfb
os.makedirs("/tmp/lfe-mpfb-user",exist_ok=True)
bpy.utils.extension_path_user=lambda package, **kwargs: "/tmp/lfe-mpfb-user"
import addon_utils
addon_utils.enable("mpfb", default_set=True)
from mpfb.services.humanservice import HumanService as H
from mpfb.services.targetservice import TargetService as T
ASSETS=args[1]
OUT=os.path.abspath(os.path.join(os.path.dirname(__file__),'../public/assets'))
def add(body, path, kind='Clothes'):
    return H.add_mhclo_asset(os.path.join(ASSETS,path),body,asset_type=kind,material_type='GAMEENGINE',subdiv_levels=0,import_subrig=False,import_weights=False)
def build(outfit='female_elegantsuit01',persona='elena'):
    bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
    macro=T.get_default_macro_info_dict(); macro.update(gender=0.0,age=0.4,muscle=0.5,weight=0.45,height=0.55)
    macro['race']={'caucasian':1.0,'asian':0.0,'african':0.0}
    if persona=='maya':
        macro.update(weight=0.56,muscle=0.4,height=0.49); macro['race']={'caucasian':0.2,'asian':0.8,'african':0.0}
    body=H.create_human(macro_detail_dict=macro)
    H.add_builtin_rig(body,'game_engine')
    rig=next(o for o in bpy.data.objects if o.type=='ARMATURE')
    H.set_character_skin(os.path.join(ASSETS,'skins/young_caucasian_female2/young_caucasian_female2.mhmat') if persona=='elena' else os.path.join(ASSETS,'skins/young_asian_female/young_asian_female.mhmat'),body,skin_type='GAMEENGINE')
    add(body,'eyes/high-poly/high-poly.mhclo','Eyes')
    add(body,'eyebrows/eyebrow001/eyebrow001.mhclo','Eyebrows')
    add(body,'hair/long01/long01.mhclo' if persona=='elena' else 'hair/bob02/bob02.mhclo','Hair')
    if persona=='maya':add(body,'eyelashes/eyelashes01/eyelashes01.mhclo','Eyelashes')
    garment=add(body,f'clothes/{outfit}/{outfit}.mhclo'); garment.name='Garment'
    shoe=add(body,'clothes/shoes03/shoes03.mhclo'); shoe.name='Shoes'
    # Bake the phenotype, then apply occlusion masks to prevent body intersections.
    for ob in list(bpy.data.objects):
        if ob.type!='MESH': continue
        bpy.context.view_layer.objects.active=ob
        if ob.data.shape_keys:
            key=ob.shape_key_add(name='Baked',from_mix=True); coords=[v.co.copy() for v in key.data]
            bpy.ops.object.shape_key_remove(all=True)
            for v,c in zip(ob.data.vertices,coords):v.co=c
        for mod in list(ob.modifiers):
            if mod.type=='MASK':bpy.ops.object.modifier_apply(modifier=mod.name)
        # A modest body-shape morph is shared by garment and skin in object space.
        ob.shape_key_add(name='Basis')
        for name,zc,width in [('Waist',1.02,0.10),('Hips',0.83,0.13),('Bust',1.22,0.09)]:
            key=ob.shape_key_add(name=name)
            for v,k in zip(ob.data.vertices,key.data):
                world=ob.matrix_world@v.co
                amount=math.exp(-((world.z-zc)/width)**2)*0.12
                if abs(world.x)<0.31:
                    k.co.x=v.co.x*(1+amount)
                    if name=='Bust':k.co.y=v.co.y*(1+amount)
        for poly in ob.data.polygons:poly.use_smooth=True
    # Every animation keys every bone: clean blending and no inherited poses.
    pb=rig.pose.bones
    def animation(name,duration,pose):
        rig.animation_data_create(); act=bpy.data.actions.new(name); rig.animation_data.action=act
        for f in range(1,duration+1,3):
            t=(f-1)/(duration-1)*math.tau
            for b in pb:
                b.rotation_mode='XYZ';b.rotation_euler=(0,0,0);b.location=(0,0,0)
            # Arms rest beside the torso, rather than in the asset's A-pose.
            for side,sign in [('l',1),('r',-1)]:
                b=pb['upperarm_'+side]
                axis=b.bone.matrix_local.to_quaternion().inverted() @ Vector((0,1,0))
                b.rotation_euler=Quaternion(axis,sign*0.65).to_euler('XYZ')
            pose(t,pb)
            for b in pb:b.keyframe_insert('rotation_euler',frame=f)
        tr=rig.animation_data.nla_tracks.new();tr.name=name;tr.strips.new(name,1,act);rig.animation_data.action=None
    def idle(t,p):
        p['spine_02'].rotation_euler.x=0.018*math.sin(t);p['head'].rotation_euler.y=0.025*math.sin(t)
    def walk(t,p):
        for side,s in [('l',1),('r',-1)]:
            p['thigh_'+side].rotation_euler.x=s*0.28*math.sin(t)
            p['calf_'+side].rotation_euler.x=-max(0,s*math.sin(t))*0.48
            p['upperarm_'+side].rotation_euler.x=-s*0.13*math.sin(t)
        p['spine_02'].rotation_euler.y=0.025*math.sin(t)
    def pose(t,p):
        p['spine_02'].rotation_euler.y=0.09*math.sin(t);p['head'].rotation_euler.y=-0.10*math.sin(t)
        p['lowerarm_l'].rotation_euler.x=0.18
    def dance(t,p):
        walk(t,p);p['spine_02'].rotation_euler.z=0.10*math.sin(t)
        p['upperarm_l'].rotation_euler.x+=0.22*math.sin(t);p['upperarm_r'].rotation_euler.x-=0.22*math.sin(t)
    animation('Idle',121,idle);animation('Walk',49,walk);animation('Pose',121,pose);animation('Dance',73,dance)
    for tr in rig.animation_data.nla_tracks:tr.mute=tr.name!='Idle'
    bpy.context.scene.frame_set(1)
    bpy.ops.wm.save_as_mainfile(filepath='/tmp/lfe-character.blend')
    for tr in rig.animation_data.nla_tracks:tr.mute=False
    for img in bpy.data.images:
        w,h=img.size
        if max(w,h)>1024:img.scale(int(w*1024/max(w,h)),int(h*1024/max(w,h)))
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,f'{persona}-{outfit}.glb'),export_format='GLB',export_animations=True,export_animation_mode='NLA_TRACKS',export_yup=True,export_morph=True,export_tangents=True)
    print('MODEL_READY',persona,outfit,flush=True)
persona='maya' if 'maya' in args[2:] else 'elena'
for outfit in ['female_elegantsuit01','female_casualsuit01','female_casualsuit02']:build(outfit,persona)

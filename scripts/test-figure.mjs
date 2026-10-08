import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const dir=path.resolve('node_modules/.cache/lfe-figure-test');await fs.mkdir(dir,{recursive:true});
const code=ts.transpileModule(await fs.readFile('src/figure.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;await fs.writeFile(dir+'/figure.mjs',code);
const {applyFigure}=await import('file://'+dir+'/figure.mjs');
const loader=new GLTFLoader();loader.register(()=>({name:'CPUTextureStub',loadTexture:()=>Promise.resolve(new THREE.Texture())}));
for(const file of (await fs.readdir('public/assets')).filter(f=>f.endsWith('.glb'))){
 const b=await fs.readFile('public/assets/'+file);const gltf=await loader.parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');
 const model=gltf.scene,mixer=new THREE.AnimationMixer(model);mixer.clipAction(gltf.animations.find(a=>a.name==='Idle')).play();mixer.update(.2);model.updateMatrixWorld(true);
 const garment=model.getObjectByName('Garment');assert.ok(garment?.isSkinnedMesh,'Actual rigged garment must be present');
 const look={outfit:'female_elegantsuit01',color:'#44182b',roughness:.36,metalness:.08};
 for(const [key,name,value] of [['waist','Waist',-1],['hips','Hips',2],['bust','Bust',2]]){
  applyFigure(model,look,1,0);const vertices=Array.from({length:garment.geometry.attributes.position.count},(_,i)=>garment.getVertexPosition(i,new THREE.Vector3()));
  applyFigure(model,{...look,[key]:value},1,0);let delta=0;for(let i=0;i<vertices.length;i++)delta=Math.max(delta,vertices[i].distanceTo(garment.getVertexPosition(i,new THREE.Vector3())));
  assert.ok(delta>.001,file+'/'+name+' must change actual garment vertices');mixer.update(.1);assert.equal(garment.morphTargetInfluences[garment.morphTargetDictionary[name]],value,'Animation must preserve the selected figure');
 }
 applyFigure(model,look,1,0);model.updateMatrixWorld(true);const before=new THREE.Box3().setFromObject(model,true).getSize(new THREE.Vector3()).y;
 applyFigure(model,{...look,height:1.1},1,0);model.updateMatrixWorld(true);const after=new THREE.Box3().setFromObject(model,true).getSize(new THREE.Vector3()).y;assert.ok(Math.abs(after/before-1.1)<.0001,'Height must alter actual world bounds');
 console.log(file+': actual garment deformation, retained morphs during animation and +10% height verified');
}
await fs.rm(dir,{recursive:true,force:true});console.log('Textures are stubbed for CPU geometry checks. No GPU or physical Safari test is claimed.');

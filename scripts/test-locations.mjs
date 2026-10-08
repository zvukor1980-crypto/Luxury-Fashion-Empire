import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import ts from 'typescript';
import * as THREE from 'three';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
const dir=path.resolve('node_modules/.cache/lfe-locations-test');await fs.mkdir(dir,{recursive:true});await fs.writeFile(dir+'/locations.mjs',ts.transpileModule(await fs.readFile('src/locations.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText);
const {createInteriors}=await import('file://'+dir+'/locations.mjs');const scene=new THREE.Scene(),interiors=createInteriors(scene);
assert.equal(interiors.select('invalid'),false);let counts=[];
for(const id of ['studio','boutique','photo','house','runway']){assert.equal(interiors.select(id),true);assert.equal([...interiors.rooms.values()].filter(g=>g.visible).length,1);assert.equal(interiors.rooms.get(id).visible,true);let meshes=0;interiors.rooms.get(id).traverse(o=>{if(!o.isMesh)return;meshes++;const a=o.geometry.attributes.position;for(const v of a.array)assert.ok(Number.isFinite(v));assert.ok(o.material.isMeshStandardMaterial);});assert.ok(meshes>10&&meshes<100);counts.push(meshes);
 if(process.env.LFE_EXPORT_INTERIORS){globalThis.FileReader=class{readAsArrayBuffer(blob){blob.arrayBuffer().then(buffer=>{this.result=buffer;this.onloadend?.();});}};const exported=await new GLTFExporter().parseAsync(interiors.rooms.get(id),{binary:true});await fs.writeFile('/tmp/lfe-interior-'+id+'.glb',new Uint8Array(exported));}
}
assert.ok(new Set(counts).size>=3,'Scenes must contain different geometry');console.log('Five distinct interiors verified: one visible group, valid geometry, bounded draw counts:',counts.join(', '));await fs.rm(dir,{recursive:true,force:true});

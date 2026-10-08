import fs from 'node:fs';
import {validateBytes} from 'gltf-validator';
const paths=fs.readdirSync('public/assets').filter(p=>p.endsWith('.glb'));
if(!paths.length)throw Error('No character GLB');
for(const path of paths){
 const b=fs.readFileSync('public/assets/'+path);
 if(b.readUInt32LE(0)!==0x46546c67||b.readUInt32LE(4)!==2||b.readUInt32LE(8)!==b.length)throw Error('Invalid GLB header');
 const j=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString());
 if(!j.skins?.length||!j.meshes?.length)throw Error('Missing rigged character');
 for(const name of ['Idle','Walk','Pose','Dance'])if(!j.animations?.some(a=>a.name===name))throw Error('Missing animation '+name);
 if([...j.images,...j.buffers].some(x=>x.uri))throw Error('External resource dependency');
 const result=await validateBytes(new Uint8Array(b),{uri:path,maxIssues:30});
 console.log(path,JSON.stringify(result.issues));
 if(result.issues.numErrors)process.exitCode=1;
}

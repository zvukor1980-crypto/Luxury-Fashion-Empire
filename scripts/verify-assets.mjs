import fs from 'node:fs';
import {validateBytes} from 'gltf-validator';
const paths=fs.readdirSync('public/assets').filter(p=>p.endsWith('.glb'));
for(const persona of ['elena','maya'])for(const outfit of ['female_elegantsuit01','female_casualsuit01','female_casualsuit02'])if(!paths.includes(persona+'-'+outfit+'.glb'))throw Error('Missing wardrobe variant '+persona+'/'+outfit);
for(const path of paths){
 const b=fs.readFileSync('public/assets/'+path);
 if(b.readUInt32LE(0)!==0x46546c67||b.readUInt32LE(4)!==2||b.readUInt32LE(8)!==b.length)throw Error('Invalid GLB header');
 const j=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString());
 if(!j.skins?.length||!j.meshes?.length)throw Error('Missing rigged character');
 for(const name of ['Idle','Walk','Pose','Dance'])if(!j.animations?.some(a=>a.name===name))throw Error('Missing animation '+name);
 if([...j.images,...j.buffers].some(x=>x.uri))throw Error('External resource dependency');
 const result=await validateBytes(new Uint8Array(b),{uri:path,maxIssues:30});
 console.log(path,JSON.stringify({errors:result.issues.numErrors,warnings:result.issues.numWarnings}));
 if(result.issues.numErrors)process.exitCode=1;
}

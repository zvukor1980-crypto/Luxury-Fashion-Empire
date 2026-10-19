import * as THREE from 'three';
// Luxury 2.0: сказочный слой поверх интерьеров — градиентное небо, подиум со светящимся кольцом,
// хрустальная люстра, лучи прожекторов, парящие искры, вспышки фотографов и конфетти на показе.
// Всё рисуется кодом, без сторонних текстур.
type Theme={top:string;mid:string;bottom:string;glow:string;spark:string;ring:string};
const themes:Record<string,Theme>={
 studio:{top:'#ffd1e6',mid:'#f39cc4',bottom:'#7d3f8f',glow:'#fff3c4',spark:'#ffe9a8',ring:'#ff7ab8'},
 boutique:{top:'#ffe9c7',mid:'#f5a9c8',bottom:'#8a3d6e',glow:'#ffffff',spark:'#ffd36b',ring:'#ffc04d'},
 photo:{top:'#ffffff',mid:'#e9eefc',bottom:'#c6c9e8',glow:'#ffffff',spark:'#a6c8ff',ring:'#8fb6ff'},
 house:{top:'#6d4bd1',mid:'#3d2a8a',bottom:'#150f33',glow:'#ffd98a',spark:'#ffdf7e',ring:'#c58bff'},
 runway:{top:'#2a1a66',mid:'#140d3a',bottom:'#06041a',glow:'#ff8fd8',spark:'#ff9ee6',ring:'#5ef0ff'}
};
function gradient(t:Theme){const c=document.createElement('canvas');c.width=16;c.height=512;const g=c.getContext('2d')!;const lg=g.createLinearGradient(0,0,0,512);lg.addColorStop(0,t.top);lg.addColorStop(.55,t.mid);lg.addColorStop(1,t.bottom);g.fillStyle=lg;g.fillRect(0,0,16,512);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;return tex;}
function dot(){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d')!;const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.18,'rgba(255,255,255,.9)');r.addColorStop(.45,'rgba(255,255,255,.25)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64);
 g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,255,255,.7)';g.fillRect(31,2,2,60);g.fillRect(2,31,60,2);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
export function createGlam(scene:THREE.Scene){
 const root=new THREE.Group();root.name='Glam';scene.add(root);const bgs=new Map<string,THREE.Texture>();
 const spark=dot();
 // Подиум: мраморный диск, золотой кант и светящееся кольцо
 const podium=new THREE.Group();root.add(podium);
 const disk=new THREE.Mesh(new THREE.CylinderGeometry(.82,.9,.09,48),new THREE.MeshStandardMaterial({color:'#fff4f8',roughness:.18,metalness:.1}));disk.position.y=-.035;disk.receiveShadow=true;podium.add(disk);
 const rim=new THREE.Mesh(new THREE.TorusGeometry(.86,.022,8,72),new THREE.MeshStandardMaterial({color:'#e8c26a',roughness:.2,metalness:.9}));rim.rotation.x=Math.PI/2;rim.position.y=.01;podium.add(rim);
 const ringMat=new THREE.MeshBasicMaterial({color:'#ff7ab8',transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false});
 const ring=new THREE.Mesh(new THREE.RingGeometry(.92,1.06,72),ringMat);ring.rotation.x=-Math.PI/2;ring.position.y=-.075;podium.add(ring);
 const halo=new THREE.Mesh(new THREE.CircleGeometry(1.6,48),new THREE.MeshBasicMaterial({map:spark,color:'#ff9ccc',transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false}));halo.rotation.x=-Math.PI/2;halo.position.y=-.07;podium.add(halo);
 // Люстра
 const chand=new THREE.Group();chand.position.set(0,2.62,-1.9);chand.scale.setScalar(.8);root.add(chand);
 const gold=new THREE.MeshStandardMaterial({color:'#f0c96a',metalness:.95,roughness:.18});
 const crystal=new THREE.MeshStandardMaterial({color:'#ffffff',emissive:'#ffe7b0',emissiveIntensity:1.4,roughness:.05,metalness:.2});
 const hoop=new THREE.Mesh(new THREE.TorusGeometry(.55,.02,6,40),gold);hoop.rotation.x=Math.PI/2;chand.add(hoop);
 const hoop2=new THREE.Mesh(new THREE.TorusGeometry(.32,.016,6,32),gold);hoop2.rotation.x=Math.PI/2;hoop2.position.y=-.18;chand.add(hoop2);
 const gem=new THREE.OctahedronGeometry(.055,0);
 for(let i=0;i<14;i++){const a=i/14*Math.PI*2;const m=new THREE.Mesh(gem,crystal);m.scale.y=1.7;m.position.set(Math.cos(a)*.55,-.09,Math.sin(a)*.55);chand.add(m);}
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2+.2;const m=new THREE.Mesh(gem,crystal);m.scale.y=1.9;m.position.set(Math.cos(a)*.32,-.28,Math.sin(a)*.32);chand.add(m);}
 const bulb=new THREE.Mesh(new THREE.SphereGeometry(.09,16,10),crystal);bulb.position.y=-.42;chand.add(bulb);
 const chandGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:spark,color:'#fff0c8',transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false}));chandGlow.scale.set(1.9,1.9,1);chandGlow.position.y=-.2;chand.add(chandGlow);
 const warm=new THREE.PointLight('#ffd9a8',3.2,7,1.6);warm.position.set(0,2.6,-.6);root.add(warm);
 // Лучи прожекторов
 const beams:THREE.Mesh[]=[];const beamGeo=new THREE.ConeGeometry(.75,3.4,32,1,true);beamGeo.translate(0,-1.7,0);
 for(const x of [-1.5,1.5]){const m=new THREE.Mesh(beamGeo,new THREE.MeshBasicMaterial({color:'#fff1d6',transparent:true,opacity:.075,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));m.position.set(x,3.3,-.6);m.rotation.z=x>0?.42:-.42;root.add(m);beams.push(m);}
 const spot=new THREE.SpotLight('#ffffff',14,9,.42,.6,1.4);spot.position.set(0,4,2.2);spot.target.position.set(0,.8,0);root.add(spot,spot.target);
 // Искры
 const N=180,pos=new Float32Array(N*3),seed=new Float32Array(N);for(let i=0;i<N;i++){pos[i*3]=(Math.random()-.5)*6.2;pos[i*3+1]=Math.random()*3.4;pos[i*3+2]=-2.8+Math.random()*4.4;seed[i]=Math.random()*100;}
 const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(pos,3));
 const sparkMat=new THREE.PointsMaterial({map:spark,size:.085,color:'#ffe9a8',transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false,sizeAttenuation:true});
 const sparks=new THREE.Points(sg,sparkMat);root.add(sparks);
 // Конфетти
 const C=220,cpos=new Float32Array(C*3),ccol=new Float32Array(C*3),cvel=new Float32Array(C*3);const palette=['#ff5fa2','#ffd23f','#5ef0ff','#b28dff','#7dff9e','#ffffff'].map(c=>new THREE.Color(c));
 for(let i=0;i<C;i++){const c=palette[i%palette.length];ccol.set([c.r,c.g,c.b],i*3);cpos[i*3+1]=-50;}
 const cg=new THREE.BufferGeometry();cg.setAttribute('position',new THREE.BufferAttribute(cpos,3));cg.setAttribute('color',new THREE.BufferAttribute(ccol,3));
 const confetti=new THREE.Points(cg,new THREE.PointsMaterial({size:.07,vertexColors:true,transparent:true,depthWrite:false}));confetti.frustumCulled=false;root.add(confetti);
 // Вспышки фотографов вдоль подиума
 const flashes:{s:THREE.Sprite;l:THREE.PointLight;t:number}[]=[];
 for(let i=0;i<6;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:spark,color:'#ffffff',transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));const x=i%2?1.75:-1.75,z=-2.2+Math.floor(i/2)*1.05;s.position.set(x,.95,z);s.scale.set(.9,.9,1);const l=new THREE.PointLight('#ffffff',0,4,2);l.position.copy(s.position);root.add(s,l);flashes.push({s,l,t:0});}
 let room='studio',showing=false,flashTimer=0;
 function select(id:string){room=id;const t=themes[id]??themes.studio;let bg=bgs.get(id);if(!bg){bg=gradient(t);bgs.set(id,bg);}scene.background=bg;if(scene.fog instanceof THREE.Fog){scene.fog.color.set(t.bottom);scene.fog.near=10;scene.fog.far=26;}
  ringMat.color.set(t.ring);(halo.material as THREE.MeshBasicMaterial).color.set(t.ring);sparkMat.color.set(t.spark);(chandGlow.material as THREE.SpriteMaterial).color.set(t.glow);
  podium.visible=id!=='runway';chand.visible=id!=='runway'&&id!=='photo';beams.forEach(b=>b.visible=id!=='photo');warm.intensity=id==='runway'?0:3.2;spot.intensity=id==='runway'?20:14;}
 function burst(){for(let i=0;i<C;i++){cpos[i*3]=(Math.random()-.5)*3.2;cpos[i*3+1]=3+Math.random()*1.6;cpos[i*3+2]=-2.4+Math.random()*3;cvel[i*3]=(Math.random()-.5)*.6;cvel[i*3+1]=-.6-Math.random()*.9;cvel[i*3+2]=(Math.random()-.5)*.6;}cg.attributes.position.needsUpdate=true;}
 function update(dt:number,time:number){
  const a=sg.attributes.position as THREE.BufferAttribute;for(let i=0;i<N;i++){let y=pos[i*3+1]+dt*(.12+(seed[i]%1)*.18);if(y>3.4)y=0;pos[i*3+1]=y;pos[i*3]+=Math.sin(time*.7+seed[i])*dt*.05;}a.needsUpdate=true;
  sparkMat.size=.075+Math.sin(time*3)*.012;
  ring.scale.setScalar(1+Math.sin(time*2.2)*.025);ringMat.opacity=.6+Math.sin(time*2.2)*.25;chand.rotation.y=time*.15;
  beams.forEach((b,i)=>{b.rotation.z=(i?.42:-.42)+Math.sin(time*.6+i*2)*.12;(b.material as THREE.MeshBasicMaterial).opacity=room==='runway'?.13:.07;});
  let live=false;for(let i=0;i<C;i++){if(cpos[i*3+1]<-.1)continue;live=true;cpos[i*3]+=(cvel[i*3]+Math.sin(time*4+i)*.3)*dt;cpos[i*3+1]+=cvel[i*3+1]*dt;cpos[i*3+2]+=cvel[i*3+2]*dt;}if(live)cg.attributes.position.needsUpdate=true;
  if(showing){flashTimer-=dt;if(flashTimer<=0){flashTimer=.12+Math.random()*.35;const f=flashes[Math.floor(Math.random()*flashes.length)];f.t=.16;}}
  for(const f of flashes){f.t=Math.max(0,f.t-dt);const k=f.t/.16;(f.s.material as THREE.SpriteMaterial).opacity=k;f.l.intensity=k*9;}
 }
 function show(on:boolean){showing=on;if(!on)for(const f of flashes)f.t=0;}
 select('studio');
 return {select,update,show,burst,get room(){return room;},root};
}

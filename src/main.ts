import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import './style.css';
const stage=document.querySelector<HTMLElement>('#stage')!;
const status=document.querySelector<HTMLElement>('#loading')!;
const retry=document.querySelector<HTMLButtonElement>('#retry')!;
const scene=new THREE.Scene();scene.background=new THREE.Color('#10141a');scene.fog=new THREE.Fog('#10141a',9,22);
const camera=new THREE.PerspectiveCamera(32,1,.05,30);camera.position.set(0,1.0,4.3);
let renderer:THREE.WebGLRenderer;
try {renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});}catch{status.textContent='На этом устройстве недоступен WebGL. Откройте игру в Safari на iPhone. Если ошибка сохраняется, закройте лишние вкладки и повторите.';retry.hidden=false;retry.textContent='Перезагрузить';retry.onclick=()=>location.reload();throw Error('WebGL unavailable');}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;
stage.prepend(renderer.domElement);
const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(new RoomEnvironment(),.04).texture;pmrem.dispose();
const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,.9,0);controls.enablePan=false;controls.enableDamping=true;controls.minDistance=1.6;controls.maxDistance=6;controls.maxPolarAngle=Math.PI*.49;
scene.add(new THREE.HemisphereLight(0xffebd4,0x383c57,.7));
const key=new THREE.DirectionalLight(0xfff1de,1.8);key.position.set(3,4,3);scene.add(key);
const rim=new THREE.DirectionalLight(0xb4caff,1.0);rim.position.set(-2,3,-3);scene.add(rim);
function box(w:number,h:number,d:number,x:number,y:number,z:number,color:string){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.3,metalness:.2}));m.position.set(x,y,z);scene.add(m);return m;}
box(9,.12,9,0,-.07,0,'#22252b');box(2.2,.05,5.5,0,-.01,-1.5,'#71614c');
for(let x of [-1.8,1.8]){box(.025,3.8,.03,x,1.8,-2.7,'#bc9b62');box(.08,3.8,.03,x+.12,1.8,-2.7,'#5c503d');}
box(5,3.5,.08,0,1.6,-3,'#1b2028');
let model:THREE.Group|undefined,mixer:THREE.AnimationMixer|undefined;let actions:Record<string,THREE.AnimationAction>={};let current:THREE.AnimationAction|undefined;let loading=false;
function animate(name:string){if(!actions[name])return;current?.fadeOut(.3);current=actions[name];current.reset().fadeIn(.3).play();}
async function load(){if(loading)return;loading=true;retry.hidden=true;status.hidden=false;status.textContent='Загрузка персонажа…';
 const abort=new AbortController();const timer=setTimeout(()=>abort.abort(),25000);
 try{const res=await fetch('/assets/elena-female_elegantsuit01.glb',{signal:abort.signal});if(!res.ok)throw Error('Файл персонажа: HTTP '+res.status);const buffer=await res.arrayBuffer();
 const gltf=await Promise.race([new GLTFLoader().parseAsync(buffer,'/assets/'),new Promise<never>((_,reject)=>setTimeout(()=>reject(Error('Обработка 3D-модели заняла слишком долго')),15000))]);
 if(!gltf.scene||!gltf.animations.length)throw Error('В файле нет персонажа или анимаций');
 model=gltf.scene;
 // MPFB exports all materials as BLEND. Opaque skin/eyes/clothes must write depth:
 // otherwise transparent sorting exposes legs through skirts and eyeballs through skin.
 model.traverse(object=>{if(!(object instanceof THREE.Mesh))return;
  for(const material of Array.isArray(object.material)?object.material:[object.material]){
   if(!(material instanceof THREE.MeshStandardMaterial))continue;
   const cutout=/long01|eyebrow/i.test(material.name);
   material.transparent=false;material.opacity=1;material.depthWrite=true;
   material.alphaTest=cutout?.45:0;material.side=THREE.DoubleSide;material.needsUpdate=true;
   if(/female_elegantsuit/.test(material.name)){material.map=null;material.color.set('#44182b');material.roughness=.36;material.metalness=.08;}
   if(/body/.test(material.name)){material.roughness=.72;material.envMapIntensity=.3;}
  }
 });scene.add(model);model.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(model);const size=bounds.getSize(new THREE.Vector3());const scale=1.75/size.y;model.scale.setScalar(scale);model.position.y=-bounds.min.y*scale;
 mixer=new THREE.AnimationMixer(model);actions={};for(const clip of gltf.animations)actions[clip.name]=mixer.clipAction(clip);animate('Idle');
 renderer.render(scene,camera);status.hidden=true;document.body.dataset.model='ready';document.querySelector('#hint')!.textContent='Персонаж загружен. Поверните пальцем, приблизьте двумя пальцами.';
 }catch(e){status.textContent=e instanceof Error?e.message:'Не удалось загрузить модель';if(abort.signal.aborted)status.textContent='Загрузка превысила 25 секунд. Проверьте интернет и нажмите «Повторить».';retry.hidden=false;document.body.dataset.model='error';}finally{clearTimeout(timer);loading=false;}}
retry.onclick=()=>void load();document.querySelectorAll<HTMLButtonElement>('[data-anim]').forEach(b=>b.onclick=()=>animate(b.dataset.anim!));
let high=false;document.querySelector<HTMLButtonElement>('#quality')!.onclick=()=>{high=!high;renderer.setPixelRatio(Math.min(devicePixelRatio,high?2:1));document.querySelector('#quality')!.textContent='Качество: '+(high?'высокое':'экономное');resize();};
function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(stage);resize();
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();status.hidden=false;status.textContent='Safari приостановил 3D. Перезагрузите страницу.';});
const clock=new THREE.Clock();let elapsed=0;
function frame(){requestAnimationFrame(frame);const dt=Math.min(clock.getDelta(),.05);if(document.hidden)return;elapsed+=dt;if(elapsed<1/30)return;mixer?.update(elapsed);elapsed=0;controls.update();renderer.render(scene,camera);}frame();void load();

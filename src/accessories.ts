import * as THREE from 'three';
// Аксессуары, собранные кодом и закреплённые на костях скелета: следуют за анимациями и ростом модели.
const gold=new THREE.MeshPhysicalMaterial({color:'#ffd27a',metalness:1,roughness:.18,clearcoat:1,clearcoatRoughness:.1});
const gemPink=new THREE.MeshPhysicalMaterial({color:'#ff7ac0',emissive:'#ff2f92',emissiveIntensity:.55,roughness:.05,metalness:.1,clearcoat:1});
const gemBlue=new THREE.MeshPhysicalMaterial({color:'#9fe6ff',emissive:'#3fb8ff',emissiveIntensity:.5,roughness:.05,metalness:.1,clearcoat:1});
const pearl=new THREE.MeshPhysicalMaterial({color:'#fff6f0',roughness:.22,metalness:.05,clearcoat:1,sheen:1,sheenColor:new THREE.Color('#ffd6ea')});
const lens=new THREE.MeshPhysicalMaterial({color:'#2a0f3a',roughness:.05,metalness:.3,clearcoat:1,transparent:true,opacity:.88});
const leather=new THREE.MeshPhysicalMaterial({color:'#f2f0ff',roughness:.25,metalness:.15,clearcoat:.8,sheen:.6,sheenColor:new THREE.Color('#c9b8ff')});
function tiara(){const g=new THREE.Group();const R=.078;const band=new THREE.Mesh(new THREE.TorusGeometry(R,.0045,8,64),gold);band.rotation.x=Math.PI/2;band.scale.set(1,1.15,1);g.add(band);
 for(let i=0;i<9;i++){const a=Math.PI*(.18+i*.08);const h=i===4?.045:i%2?.022:.032;const x=Math.cos(a)*R,z=Math.sin(a)*R*1.15;const spike=new THREE.Mesh(new THREE.ConeGeometry(.0055,h,6),gold);spike.position.set(x,h/2,z);g.add(spike);
  const gem=new THREE.Mesh(new THREE.OctahedronGeometry(i===4?.012:.0065),i%2?gemBlue:gemPink);gem.position.set(x,h+.004,z);g.add(gem);}
 g.rotation.x=-.28;return g;}
function necklace(){const g=new THREE.Group();const n=26;for(let i=0;i<n;i++){const a=Math.PI*(.08+i/(n-1)*.84);const p=new THREE.Mesh(new THREE.SphereGeometry(i===13?.011:.0062,10,8),i===13?gemPink:pearl);p.position.set(Math.cos(a)*.075,-Math.sin(a)*.05-.0,Math.sin(a)*.068);g.add(p);}return g;}
function glasses(){const g=new THREE.Group();for(const x of [-.034,.034]){const rim=new THREE.Mesh(new THREE.TorusGeometry(.024,.0032,8,32),gold);rim.position.x=x;rim.scale.y=.8;g.add(rim);const l=new THREE.Mesh(new THREE.CircleGeometry(.023,32),lens);l.position.set(x,0,.001);l.scale.y=.8;g.add(l);
 const arm=new THREE.Mesh(new THREE.BoxGeometry(.003,.003,.09),gold);arm.position.set(x*1.75,.004,-.045);g.add(arm);}const bridge=new THREE.Mesh(new THREE.TorusGeometry(.011,.0025,6,16,Math.PI),gold);bridge.position.y=.006;g.add(bridge);return g;}
function clutch(){const g=new THREE.Group();const shape=new THREE.Shape();shape.moveTo(-.07,0);shape.lineTo(.07,0);shape.quadraticCurveTo(.08,.07,0,.075);shape.quadraticCurveTo(-.08,.07,-.07,0);
 const body=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.028,bevelEnabled:true,bevelSize:.006,bevelThickness:.006,bevelSegments:3,curveSegments:16}),leather);body.position.z=-.014;g.add(body);
 const clasp=new THREE.Mesh(new THREE.TorusGeometry(.012,.003,8,24),gold);clasp.position.set(0,.06,.02);g.add(clasp);const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.008),gemPink);gem.position.set(0,.06,.022);g.add(gem);return g;}
function earrings(){const g=new THREE.Group();for(const x of [-.075,.075]){const hook=new THREE.Mesh(new THREE.TorusGeometry(.006,.0014,6,16),gold);hook.position.x=x;g.add(hook);const drop=new THREE.Mesh(new THREE.SphereGeometry(.009,12,10),gemBlue);drop.scale.y=1.5;drop.position.set(x,-.02,0);g.add(drop);}return g;}
const build:Record<string,()=>THREE.Group>={tiara,necklace,glasses,clutch,earrings};
// Положение относительно костей в мировых координатах модели в позе покоя (рост 1,75 м).
export function wearAccessories(model:THREE.Object3D,ids:string[]){
 model.traverse(o=>{});const old:THREE.Object3D[]=[];model.traverse(o=>{if(o.userData.lfeAccessory)old.push(o);});old.forEach(o=>o.parent?.remove(o));
 if(!ids.length)return 0;
 const bone=(n:string)=>{let b:THREE.Object3D|undefined;model.traverse(o=>{if(!b&&o.name===n)b=o;});return b;};
 const head=bone('head'),neck=bone('neck_01'),hand=bone('hand_r');if(!head||!neck)return 0;
 model.updateMatrixWorld(true);const hp=head.getWorldPosition(new THREE.Vector3()),np=neck.getWorldPosition(new THREE.Vector3());const floor=model.getWorldPosition(new THREE.Vector3()).y-model.position.y+0;const k=Math.max(.5,(hp.y-floor)/1.587);
 const place:Record<string,[THREE.Object3D|undefined,THREE.Vector3]>={
  tiara:[head,new THREE.Vector3(hp.x,hp.y+.128*k,hp.z-.01*k)],
  glasses:[head,new THREE.Vector3(hp.x,hp.y+.03*k,hp.z+.112*k)],
  earrings:[head,new THREE.Vector3(hp.x,hp.y-.012*k,hp.z-.005*k)],
  necklace:[neck,new THREE.Vector3(np.x,np.y-.03*k,np.z+.03*k)],
  clutch:[hand,hand?hand.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,-.06*k,.02*k)):new THREE.Vector3()]};
 let n=0;for(const id of ids){const f=build[id],pl=place[id];if(!f||!pl||!pl[0])continue;const parent=pl[0];const acc=f();acc.userData.lfeAccessory=id;acc.name='Acc-'+id;
  acc.traverse(o=>{if(o instanceof THREE.Mesh){o.castShadow=true;}});
  const wq=parent.getWorldQuaternion(new THREE.Quaternion()),ws=parent.getWorldScale(new THREE.Vector3());const mq=model.getWorldQuaternion(new THREE.Quaternion());
  parent.add(acc);acc.position.copy(parent.worldToLocal(pl[1].clone()));acc.quaternion.copy(wq.invert().multiply(mq));acc.scale.setScalar(k/ws.x);n++;}
 return n;}

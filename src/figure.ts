import * as THREE from 'three';
import type {Look} from './game';
export function applyFigure(model:THREE.Group,look:Look,baseScale:number,baseY:number){
 const height=THREE.MathUtils.clamp(look.height??1,.9,1.1);
 model.scale.setScalar(baseScale*height);model.position.y=baseY*height;
 model.traverse(object=>{
  if(!(object instanceof THREE.Mesh)||!object.morphTargetDictionary||!object.morphTargetInfluences)return;
  for(const [name,value] of [['Waist',THREE.MathUtils.clamp(look.waist??0,-1,1)],['Hips',THREE.MathUtils.clamp(look.hips??0,0,2)],['Bust',THREE.MathUtils.clamp(look.bust??0,0,2)]] as const){
   const index=object.morphTargetDictionary[name];if(index!==undefined)object.morphTargetInfluences[index]=value;
  }
 });
}

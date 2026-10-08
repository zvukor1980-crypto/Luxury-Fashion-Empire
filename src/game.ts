export const outfits=[
 {id:'female_elegantsuit01',name:'Винный силуэт',description:'Жакет и юбка',price:0},
 {id:'female_casualsuit01',name:'Городская коллекция',description:'Футболка и облегающие брюки',price:450},
 {id:'female_casualsuit02',name:'Современный силуэт',description:'Футболка и короткие шорты',price:750}
];
export const stages=[['Студия',0],['Первый бутик',900],['Фотостудия',2200],['Дом моды',5000],['Большой магазин',10000],['Фабрика',21000],['Сеть бутиков',45000],['Штаб-квартира',90000],['Мировая империя',180000]] as const;
export type Look={outfit:string;color:string;roughness:number;metalness:number};
export type Save={version:1;money:number;owned:string[];look:Look;level:number;staff:number;sales:number;shows:number;earned:number;daily:string;favorites:Look[]};
export const initial=():Save=>({version:1,money:1200,owned:[outfits[0].id],look:{outfit:outfits[0].id,color:'#44182b',roughness:.36,metalness:.08},level:0,staff:0,sales:0,shows:0,earned:0,daily:'',favorites:[]});
const key='lfe-save-v1';
export function readSave():Save{try{const j=JSON.parse(localStorage.getItem(key)||'null');if(!j||j.version!==1)return initial();const s=initial();
 for(const k of ['money','staff','sales','shows','earned'] as const)if(Number.isFinite(j[k])&&j[k]>=0)s[k]=Math.min(j[k],1e9);
 s.level=Number.isInteger(j.level)?Math.max(0,Math.min(stages.length-1,j.level)):0;
 s.owned=outfits.filter(o=>o.price===0||j.owned?.includes(o.id)).map(o=>o.id);
 const valid=(l:Look)=>l&&s.owned.includes(l.outfit)&&/^#[0-9a-f]{6}$/i.test(l.color)&&Number.isFinite(l.roughness)&&l.roughness>=.08&&l.roughness<=1&&Number.isFinite(l.metalness)&&l.metalness>=0&&l.metalness<=1;
 if(valid(j.look))s.look=j.look;if(Array.isArray(j.favorites))s.favorites=j.favorites.filter(valid).slice(0,6);s.daily=typeof j.daily==='string'?j.daily:'';return s;
 }catch{return initial();}}
export function persist(s:Save){try{localStorage.setItem(key,JSON.stringify(s));return true;}catch{return false;}}
export function purchase(s:Save,id:string){const item=outfits.find(o=>o.id===id);if(!item||s.owned.includes(id)||s.money<item.price)return false;s.money-=item.price;s.owned.push(id);return true;}
export function upgrade(s:Save){const n=stages[s.level+1];if(!n||s.money<n[1])return false;s.money-=n[1];s.level++;return true;}
export function sale(s:Save){const revenue=60+s.level*35+s.staff*15;const cost=22+s.staff*7;const profit=revenue-cost;s.money+=profit;s.earned+=profit;s.sales++;return {revenue,cost,profit};}

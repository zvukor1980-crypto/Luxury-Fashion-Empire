export const locations=[{id:'studio',name:'Студия',level:0},{id:'boutique',name:'Бутик',level:1},{id:'photo',name:'Фотостудия',level:2},{id:'house',name:'Дом моды',level:3},{id:'runway',name:'Подиум',level:0}] as const;
export const outfits=[
 {id:'female_elegantsuit01',name:'Винный силуэт',description:'Жакет и юбка',price:0},
 {id:'female_casualsuit01',name:'Городская коллекция',description:'Футболка и облегающие брюки',price:450},
 {id:'female_casualsuit02',name:'Современный силуэт',description:'Футболка и короткие шорты',price:750}
];
export const stages=[['Студия',0],['Первый бутик',900],['Фотостудия',2200],['Дом моды',5000],['Большой магазин',10000],['Фабрика',21000],['Сеть бутиков',45000],['Штаб-квартира',90000],['Мировая империя',180000]] as const;
export type Look={outfit:string;color:string;roughness:number;metalness:number;persona?:string;height?:number;waist?:number;hips?:number;bust?:number};
export type Save={version:1;money:number;owned:string[];look:Look;level:number;staff:number;sales:number;shows:number;earned:number;daily:string;favorites:Look[];location:string;fame:number;vipDone:number;lastSeen:number;trendDay:string;accOwned:string[];accWorn:string[];trophies:{gold:number;silver:number;bronze:number};fwRound:number;mood:string};
export const initial=():Save=>({version:1,money:1200,owned:[outfits[0].id],look:{outfit:outfits[0].id,color:'#44182b',roughness:.36,metalness:.08},level:0,staff:0,sales:0,shows:0,earned:0,daily:'',favorites:[],location:'studio',fame:0,vipDone:0,lastSeen:0,trendDay:'',accOwned:[],accWorn:[],trophies:{gold:0,silver:0,bronze:0},fwRound:0,mood:'day'});
const key='lfe-save-v1';
// ——— Luxury 2.0: палитры, тренд дня, VIP-заказы, слава, доход офлайн ———
export const palettes=[{id:'rose',name:'Розовое шампанское',color:'#e8789f'},{id:'ruby',name:'Рубин',color:'#b3123f'},{id:'emerald',name:'Изумруд',color:'#11845b'},{id:'sapphire',name:'Сапфир',color:'#1f4fbf'},{id:'gold',name:'Золото',color:'#d4a72c'},{id:'lilac',name:'Лаванда',color:'#a07ad8'},{id:'coral',name:'Коралл',color:'#ff6f5e'},{id:'noir',name:'Чёрный бархат',color:'#1b1622'},{id:'pearl',name:'Жемчуг',color:'#efe7dc'}] as const;
export const fabrics=[{id:'satin',name:'Сатин',roughness:.42,metalness:.08},{id:'leather',name:'Кожа',roughness:.16,metalness:.08},{id:'chrome',name:'Металлик',roughness:.12,metalness:.75}] as const;
export const fabricOf=(l:Look)=>l.metalness>.5?'chrome':l.roughness<.3?'leather':'satin';
const hex=(c:string)=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
export function colorClose(a:string,b:string){const x=hex(a),y=hex(b);return Math.hypot(x[0]-y[0],x[1]-y[1],x[2]-y[2])<=90;}
export const nearestPalette=(c:string)=>palettes.reduce((best,p)=>{const x=hex(c),y=hex(p.color),d=Math.hypot(x[0]-y[0],x[1]-y[1],x[2]-y[2]);return d<best.d?{p,d}:best;},{p:palettes[0] as typeof palettes[number],d:1e9}).p;
function hash(t:string){let h=2166136261;for(const ch of t){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
export const today=()=>new Date().toLocaleDateString('sv-SE');
export function trendOf(day:string){const h=hash('trend'+day);return {palette:palettes[h%palettes.length],fabric:fabrics[(h>>>8)%fabrics.length]};}
export function matchesTrend(l:Look,day:string){const t=trendOf(day);return colorClose(l.color,t.palette.color)&&fabricOf(l)===t.fabric.id;}
const clients=['Графиня Аурелия','Певица Лиора','Блогер Мира','Актриса Дафна','Принцесса Селена','Дизайнер Нуар','Модель Илана','Баронесса Вивьен'];
export function vipOrder(s:Save){const h=hash('vip'+s.vipDone);return {client:clients[h%clients.length],outfit:outfits[(h>>>4)%outfits.length],palette:palettes[(h>>>9)%palettes.length],fabric:fabrics[(h>>>14)%fabrics.length],reward:260+s.level*70+s.vipDone*15};}
export function fulfillVip(s:Save){const o=vipOrder(s);const l=s.look;const ok=l.outfit===o.outfit.id&&colorClose(l.color,o.palette.color)&&fabricOf(l)===o.fabric.id;if(!ok)return null;s.money+=o.reward;s.earned+=o.reward;s.fame+=6;s.vipDone++;return o;}
export const fameTiers=[[0,'Новичок',0],[30,'Восходящая звезда',.05],[90,'Любимица прессы',.1],[200,'Икона стиля',.16],[400,'Легенда моды',.25]] as const;
export function fameTier(f:number){let i=0;for(let k=0;k<fameTiers.length;k++)if(f>=fameTiers[k][0])i=k;const t=fameTiers[i],n=fameTiers[i+1];return {index:i,name:t[1],bonus:t[2],next:n?n[0]:null,from:t[0]};}
export function showRating(s:Save,day=today()){const trend=matchesTrend(s.look,day);return {rating:Math.min(100,68+s.owned.length*5+s.level*2+(trend?12:0)),trend};}
// ——— Luxury 3.0: аксессуары, Неделя моды, настроение света ———
export const accessories=[{id:'tiara',name:'Тиара «Звёздная»',price:600,bonus:6},{id:'necklace',name:'Колье «Жемчужная нить»',price:900,bonus:7},{id:'glasses',name:'Очки «Ривьера»',price:450,bonus:4},{id:'clutch',name:'Клатч «Луна»',price:750,bonus:5},{id:'earrings',name:'Серьги «Капли росы»',price:1100,bonus:8}] as const;
export const moods=[{id:'day',name:'Утро'},{id:'sunset',name:'Закат'},{id:'neon',name:'Неон'},{id:'royal',name:'Бал'}] as const;
export function buyAccessory(s:Save,id:string){const a=accessories.find(x=>x.id===id);if(!a||s.accOwned.includes(id)||s.money<a.price)return false;s.money-=a.price;s.accOwned.push(id);s.accWorn.push(id);return true;}
export function toggleAccessory(s:Save,id:string){if(!s.accOwned.includes(id))return false;s.accWorn=s.accWorn.includes(id)?s.accWorn.filter(x=>x!==id):[...s.accWorn,id];return true;}
export const fwThemes=[{id:'gala',name:'Гала-вечер',text:'Металлический блеск и украшения',fabric:'chrome',palette:'gold',acc:'necklace'},{id:'riviera',name:'Ривьера',text:'Лёгкий сатин и солнечные очки',fabric:'satin',palette:'coral',acc:'glasses'},{id:'royal',name:'Королевский бал',text:'Благородный цвет и тиара',fabric:'satin',palette:'sapphire',acc:'tiara'},{id:'noir',name:'Ночной Париж',text:'Кожа, чёрный бархат и клатч',fabric:'leather',palette:'noir',acc:'clutch'},{id:'garden',name:'Цветущий сад',text:'Изумруд и серьги-капли',fabric:'satin',palette:'emerald',acc:'earrings'},{id:'candy',name:'Розовая мечта',text:'Розовый сатин и тиара',fabric:'satin',palette:'rose',acc:'tiara'}] as const;
export const fwTheme=(s:Save)=>fwThemes[s.fwRound%fwThemes.length];
export const judges=[{id:'josephine',name:'Мадам Жозефина',role:'кутюрье',color:'#ff5fa2'},{id:'leo',name:'Маэстро Лео',role:'фотограф',color:'#5ec8ff'},{id:'vega',name:'Критик Вега',role:'журнал «Блеск»',color:'#ffd36b'}] as const;
export function judgeFashionWeek(s:Save,seed=Date.now()){const t=fwTheme(s);const l=s.look;const pal=palettes.find(p=>p.id===t.palette)!;
 const color=colorClose(l.color,pal.color),fabric=fabricOf(l)===t.fabric,acc=s.accWorn.includes(t.acc);const extra=s.accWorn.reduce((n,id)=>n+(accessories.find(a=>a.id===id)?.bonus??0),0);
 const base=4.2+(color?2:0)+(fabric?1.6:0)+(acc?1.4:0)+Math.min(1,extra/30)+Math.min(.6,s.fame/600);
 let r=hash('fw'+seed+s.fwRound);const scores=judges.map(()=>{r=Math.imul(r^r>>>15,2246822507)>>>0;return Math.max(1,Math.min(10,Math.round((base+((r%100)/100-.5)*1.4)*10)/10));});
 const total=Math.round(scores.reduce((a,b)=>a+b,0)*10)/10;const medal=total>=26?'gold':total>=21?'silver':total>=15?'bronze':null;
 const reward=medal?{gold:1500,silver:800,bronze:400}[medal]+s.level*80:120;const fame=medal?{gold:25,silver:14,bronze:8}[medal]:2;
 s.money+=reward;s.earned+=reward;s.fame+=fame;if(medal)s.trophies[medal]++;s.fwRound++;
 return {theme:t,scores,total,medal,reward,fame,checks:{color,fabric,acc}};}
export const OFFLINE_CAP=2*3600*1000;
export function offlineIncome(s:Save,now=Date.now()){if(!s.lastSeen||now<=s.lastSeen){s.lastSeen=now;return 0;}const span=Math.min(now-s.lastSeen,OFFLINE_CAP);s.lastSeen=now;const n=Math.floor(span/12000);if(n<10)return 0;const per=(60+s.level*35+s.staff*15)-(22+s.staff*7);const v=Math.round(n*per*.25);s.money+=v;s.earned+=v;return v;}
export function readSave():Save{try{const j=JSON.parse(localStorage.getItem(key)||'null');if(!j||j.version!==1)return initial();const s=initial();
 for(const k of ['money','staff','sales','shows','earned','fame','vipDone'] as const)if(Number.isFinite(j[k])&&j[k]>=0)s[k]=Math.min(j[k],1e9);
 s.level=Number.isInteger(j.level)?Math.max(0,Math.min(stages.length-1,j.level)):0;
 if(locations.some(l=>l.id===j.location&&l.level<=s.level))s.location=j.location;
 s.owned=outfits.filter(o=>o.price===0||j.owned?.includes(o.id)).map(o=>o.id);
 const valid=(l:Look)=>l&&s.owned.includes(l.outfit)&&/^#[0-9a-f]{6}$/i.test(l.color)&&Number.isFinite(l.roughness)&&l.roughness>=.08&&l.roughness<=1&&Number.isFinite(l.metalness)&&l.metalness>=0&&l.metalness<=1&&(l.persona===undefined||['elena','maya'].includes(l.persona))&&(l.height===undefined||Number.isFinite(l.height)&&l.height>=.9&&l.height<=1.1)&&['waist','hips','bust'].every(k=>{const value=l[k as 'waist'|'hips'|'bust'];return value===undefined||Number.isFinite(value)&&value>=(k==='waist'?-1:0)&&value<=(k==='waist'?1:2);});
 if(valid(j.look))s.look=j.look;if(Array.isArray(j.favorites))s.favorites=j.favorites.filter(valid).slice(0,6);s.daily=typeof j.daily==='string'?j.daily:'';s.trendDay=typeof j.trendDay==='string'?j.trendDay:'';s.accOwned=accessories.filter(a=>Array.isArray(j.accOwned)&&j.accOwned.includes(a.id)).map(a=>a.id);s.accWorn=s.accOwned.filter(id=>Array.isArray(j.accWorn)&&j.accWorn.includes(id));if(j.trophies&&typeof j.trophies==='object')for(const k of ['gold','silver','bronze'] as const){const v=j.trophies[k];if(Number.isInteger(v)&&v>=0)s.trophies[k]=Math.min(v,1e6);}if(Number.isInteger(j.fwRound)&&j.fwRound>=0)s.fwRound=Math.min(j.fwRound,1e6);if(moods.some(m=>m.id===j.mood))s.mood=j.mood;s.lastSeen=Number.isFinite(j.lastSeen)&&j.lastSeen>0?Math.min(j.lastSeen,Date.now()):0;return s;
 }catch{return initial();}}
export function persist(s:Save){try{localStorage.setItem(key,JSON.stringify(s));return true;}catch{return false;}}
export function purchase(s:Save,id:string){const item=outfits.find(o=>o.id===id);if(!item||s.owned.includes(id)||s.money<item.price)return false;s.money-=item.price;s.owned.push(id);return true;}
export function upgrade(s:Save){const n=stages[s.level+1];if(!n||s.money<n[1])return false;s.money-=n[1];s.level++;const room=locations.find(l=>l.level===s.level);if(room)s.location=room.id;return true;}
export function sale(s:Save){const revenue=Math.round((60+s.level*35+s.staff*15)*(1+fameTier(s.fame??0).bonus));const cost=22+s.staff*7;const profit=revenue-cost;s.money+=profit;s.earned+=profit;s.sales++;return {revenue,cost,profit};}

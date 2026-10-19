// Luxury 2.0 визуальная проверка 390×844: студия, локации, VIP, показ с вспышками, итоговый попап.
const puppeteer=require('/workspace/ferma-shemesh/node_modules/puppeteer-core');
const BASE=process.env.BASE||'http://127.0.0.1:5400/';const OUT=__dirname+'/../shots/';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let fails=0;const ok=(c,m)=>{console.log((c?'  ✔ ':'  ✘ ')+m);if(!c)fails++;};
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
await p.evaluateOnNewDocument(()=>{if(sessionStorage.getItem('seeded'))return;sessionStorage.setItem('seeded','1');localStorage.setItem('lfe-save-v1',JSON.stringify({version:1,money:20000,owned:['female_elegantsuit01','female_casualsuit01','female_casualsuit02'],look:{outfit:'female_elegantsuit01',color:'#44182b',roughness:.36,metalness:.08},level:4,staff:2,sales:40,shows:2,earned:5000,daily:'',favorites:[],location:'studio'}));});
await p.goto(BASE,{waitUntil:'networkidle0'});await p.waitForFunction(()=>document.body.dataset.model,{timeout:60000});await sleep(1500);
ok(await p.evaluate(()=>document.body.dataset.model==='ready'),'3D model loaded');
let s=await p.evaluate(()=>JSON.parse(localStorage.getItem('lfe-save-v1')));ok(s.money===20000&&s.level===4&&s.fame===0&&s.lastSeen>0,'old save migrated: money/level kept, new fields added');
await p.screenshot({path:OUT+'v2-studio.png'});
for(const id of ['boutique','house','photo']){await p.evaluate(()=>document.querySelector('[data-tab="locations"]').click());await p.evaluate(id=>document.querySelector(`[data-location="${id}"]`).click(),id);await sleep(900);ok(await p.evaluate(()=>__LFE.glam.room)===id,'room '+id);await p.screenshot({path:OUT+'v2-room-'+id+'.png'});}
await p.evaluate(()=>document.querySelector('[data-tab="vip"]').click());await sleep(200);
const vip0=await p.evaluate(()=>JSON.parse(localStorage.getItem('lfe-save-v1')).vipDone);
await p.evaluate(()=>document.querySelector('[data-vip-dress]').click());await sleep(500);await p.waitForFunction(()=>document.querySelector('[data-vip-dress]')&&!document.querySelector('[data-vip-dress]').disabled,{timeout:40000});await sleep(1500);
ok(await p.evaluate(()=>document.querySelectorAll('.checks li.ok').length===3),'VIP look prepared: all 3 checks green');
await p.screenshot({path:OUT+'v2-vip.png'});
await p.evaluate(()=>document.querySelector('#vip').click());await sleep(700);
s=await p.evaluate(()=>JSON.parse(localStorage.getItem('lfe-save-v1')));ok(s.vipDone===vip0+1&&s.fame>=6,'VIP order fulfilled, fame '+s.fame);
await p.screenshot({path:OUT+'v2-vip-done.png'});await p.evaluate(()=>document.querySelector('.lux-pop button').click());
await p.evaluate(()=>document.querySelector('[data-tab="wardrobe"]').click());await p.evaluate(()=>document.querySelector('[data-palette="sapphire"]').click());await sleep(400);
ok(await p.evaluate(()=>JSON.parse(localStorage.getItem('lfe-save-v1')).look.color==='#1f4fbf'),'palette swatch applies color');
await p.evaluate(()=>document.querySelector('[data-tab="career"]').click());await p.evaluate(()=>document.querySelector('#show').click());await sleep(6200);
await p.screenshot({path:OUT+'v2-runway.png'});
await p.waitForFunction(()=>document.querySelector('.lux-pop'),{timeout:30000});await sleep(700);
s=await p.evaluate(()=>JSON.parse(localStorage.getItem('lfe-save-v1')));ok(s.shows===3,'show finished and counted');
await p.screenshot({path:OUT+'v2-show-result.png'});await p.evaluate(()=>document.querySelector('.lux-pop button').click());
await sleep(300);await p.screenshot({path:OUT+'v2-career.png',fullPage:true});
// 3.0: аксессуары + Неделя моды + свет
await p.evaluate(()=>document.querySelector('[data-tab="wardrobe"]').click());
for(const id of ['tiara','glasses','necklace']){await p.evaluate(id=>document.querySelector(`[data-acc="${id}"]`).click(),id);await sleep(400);}
s=await p.evaluate(()=>JSON.parse(localStorage.getItem('lfe-save-v1')));ok(s.accOwned.length===3&&s.accWorn.length===3,'3 accessories bought and worn');
ok(await p.evaluate(()=>__LFE.acc)===3,'3 accessories attached to skeleton');
await p.evaluate(()=>document.querySelector('[data-tab="locations"]').click());await p.evaluate(()=>document.querySelector('[data-mood="neon"]').click());await sleep(800);
ok(await p.evaluate(()=>__LFE.glam.moodId==='neon'&&JSON.parse(localStorage.getItem('lfe-save-v1')).mood==='neon'),'neon light mood');
await p.evaluate(()=>document.querySelector('[data-location="studio"]').click());await sleep(600);
await p.evaluate(()=>{document.querySelector('[data-tab="appearance"]').click();document.querySelector('[data-view="face"]').click();});await sleep(1200);await p.screenshot({path:OUT+'v3-accessories.png'});
await p.evaluate(()=>document.querySelector('[data-view="full"]').click());await sleep(500);
await p.evaluate(()=>document.querySelector('[data-tab="fw"]').click());await sleep(300);await p.screenshot({path:OUT+'v3-fashion-week.png',fullPage:true});
const fw0=await p.evaluate(()=>JSON.parse(localStorage.getItem('lfe-save-v1')).fwRound);
await p.evaluate(()=>document.querySelector('#fw-go').click());await p.waitForFunction(()=>document.querySelector('.fwres'),{timeout:40000});await sleep(1800);
s=await p.evaluate(()=>JSON.parse(localStorage.getItem('lfe-save-v1')));ok(s.fwRound===fw0+1,'fashion week round judged');
await p.screenshot({path:OUT+'v3-judges.png'});await p.evaluate(()=>document.querySelector('.lux-pop button').click());
await p.reload({waitUntil:'networkidle0'});await p.waitForFunction(()=>document.body.dataset.model==='ready',{timeout:60000});await sleep(800);
ok(await p.evaluate(()=>__LFE.acc)===3&&await p.evaluate(()=>__LFE.glam.moodId)==='neon','accessories + mood restored after reload');
ok(errs.length===0,'no console errors'+(errs.length?': '+errs.slice(0,3).join(' | '):''));
await b.close();console.log(fails?'FAILED '+fails:'ALL PASSED');process.exit(fails?1:0);})();

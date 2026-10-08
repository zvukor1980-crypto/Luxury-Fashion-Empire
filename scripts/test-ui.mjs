import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import ts from 'typescript';
import {JSDOM} from 'jsdom';
const temp=await fs.mkdtemp(path.join(os.tmpdir(),'lfe-ui-'));
for(const name of ['game','ui']){const source=await fs.readFile('src/'+name+'.ts','utf8');let code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;code=code.replaceAll("'./game'","'./game.mjs'").replaceAll("'./audio'","'./audio.mjs'");await fs.writeFile(path.join(temp,name+'.mjs'),code);}
await fs.writeFile(path.join(temp,'audio.mjs'),'let on=false;export async function toggleAudio(){on=!on;return on;}');
const dom=new JSDOM('<div id="panel"></div>',{url:'https://example.test',pretendToBeVisual:true});
Object.assign(globalThis,{document:dom.window.document,localStorage:dom.window.localStorage});
const intervals=[];globalThis.setInterval=fn=>{intervals.push(fn);return intervals.length;};globalThis.setTimeout=()=>0;
const {mountGame}=await import('file://'+temp+'/ui.mjs');let changes=[],views=[],shows=0;
mountGame(async look=>{changes.push({...look});return true;},async()=>{shows++;return true;},async()=>null,view=>views.push(view));
const click=selector=>{const b=document.querySelector(selector);assert.ok(b,selector);b.click();};
const flush=async()=>{for(let i=0;i<6;i++)await Promise.resolve();};
click('[data-tab="appearance"]');const original=document.querySelector('[data-persona="maya"]');
for(let i=0;i<20;i++)intervals[0]();
assert.equal(document.querySelectorAll('[data-persona="maya"]').length,1,'Auto-sales must never duplicate the appearance screen');
assert.equal(document.querySelector('[data-persona="maya"]'),original,'Auto-sales must preserve buttons and handlers');
click('[data-persona="maya"]');await flush();assert.equal(changes.at(-1).persona,'maya');
for(const name of ['height','waist','hips','bust']){const input=document.querySelector('[data-shape="'+name+'"]');input.value=name==='height'?'1.05':'.5';input.dispatchEvent(new dom.window.Event('input'));await flush();assert.equal(changes.at(-1)[name],name==='height'?1.05:.5);}
for(const mode of ['full','face','side'])click('[data-view="'+mode+'"]');assert.deepEqual(views,['full','face','side']);
click('#music');await flush();assert.match(document.querySelector('#music').textContent,/вкл/);click('#music');await flush();assert.match(document.querySelector('#music').textContent,/выкл/);
click('[data-tab="wardrobe"]');click('[data-outfit="female_casualsuit01"]');await flush();assert.equal(changes.at(-1).outfit,'female_casualsuit01');
click('[data-fabric="chrome"]');await flush();assert.equal(changes.at(-1).metalness,.75);
click('#favorite');click('[data-favorite="0"]');await flush();assert.equal(changes.at(-1).persona,'maya');
click('[data-tab="business"]');click('#sell');click('#upgrade');click('#hire');
let saved=JSON.parse(localStorage.getItem('lfe-save-v1'));assert.equal(saved.level,1);assert.equal(saved.staff,1);assert.ok(saved.sales>=21);
click('[data-tab="career"]');click('#daily');const dailyBalance=JSON.parse(localStorage.getItem('lfe-save-v1')).money;click('#daily');assert.equal(JSON.parse(localStorage.getItem('lfe-save-v1')).money,dailyBalance);
click('#show');await flush();saved=JSON.parse(localStorage.getItem('lfe-save-v1'));assert.equal(shows,1);assert.equal(saved.shows,1);assert.equal(document.querySelector('#show').disabled,false);
click('#photo');await flush();assert.match(document.querySelector('#toast').textContent,/загрузки/);
for(let i=0;i<8;i++){click('[data-tab="appearance"]');intervals[0]();click('[data-tab="business"]');}
assert.ok(document.querySelector('#sell').onclick);click('[data-tab="locations"]');assert.equal(document.querySelector('[data-location="house"]').disabled,true);click('[data-location="boutique"]');assert.equal(JSON.parse(localStorage.getItem('lfe-save-v1')).location,'boutique');click('[data-location="runway"]');assert.equal(JSON.parse(localStorage.getItem('lfe-save-v1')).location,'runway');
console.log('UI checks passed: 20 auto-sales preserve buttons, character and figure callbacks, 3 cameras, music controls, wardrobe purchase/material/favorite, sale, upgrade, hire, daily duplicate guard, show completion and photo-not-ready feedback. 3D callbacks are mocked; this is not an iPhone render test.');
const before=JSON.parse(localStorage.getItem('lfe-save-v1'));mountGame(async()=>{throw Error('load failed');},async()=>{throw Error('context lost');},async()=>{throw Error('photo failed');});click('[data-tab="appearance"]');click('[data-persona="maya"]');await flush();assert.equal(document.querySelector('[data-persona="maya"]').disabled,false);assert.match(document.querySelector('#toast').textContent,/Ошибка/);click('[data-tab="career"]');click('#show');await flush();assert.equal(JSON.parse(localStorage.getItem('lfe-save-v1')).money,before.money);assert.equal(document.querySelector('#show').disabled,false);click('#photo');await flush();assert.match(document.querySelector('#toast').textContent,/Не удалось сделать/);console.log('Failed model/show/photo operations recover controls; show fee is refunded.');
await fs.rm(temp,{recursive:true,force:true});

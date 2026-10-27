import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:true});
const p = await b.newPage();
await p.setViewport({width:1440,height:900});
await p.goto('http://localhost:3000/',{waitUntil:'networkidle0',timeout:180000});
const y = await p.evaluate(()=>document.querySelector('.cabinet-door').getBoundingClientRect().top+window.scrollY);
await p.evaluate(v=>window.scrollTo(0,v), y-700);
await new Promise(r=>setTimeout(r,800));
console.log(await p.evaluate(()=>{
  const d=document.querySelector('.cabinet-door--l');
  const cs=getComputedStyle(d);
  const an=d.getAnimations().map(a=>({name:a.animationName, tl:a.timeline&&a.timeline.constructor.name, ct:String(a.currentTime), play:a.playState}));
  return {name:cs.animationName, tl:cs.animationTimeline, range:cs.animationRange, dur:cs.animationDuration, an};
}));
// проверим и работающую полосу-параллакс
console.log(await p.evaluate(()=>{
  const i=document.querySelector('.band-parallax img');
  return i? {tl:getComputedStyle(i).animationTimeline, n:i.getAnimations().length}:'нет';
}));
await b.close();

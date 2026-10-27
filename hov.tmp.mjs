import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:true});
const p = await b.newPage();
await p.setViewport({width:1440,height:900,deviceScaleFactor:1});
const errs=[]; p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200));});
p.on('pageerror',e=>errs.push('PAGEERROR '+e.message.slice(0,200)));
await p.goto('http://localhost:3000/portfolio',{waitUntil:'networkidle0',timeout:120000});
await p.evaluate(()=>window.scrollTo(0,1200));
await new Promise(r=>setTimeout(r,2000));
const cards = await p.$$('a.hinge');
console.log('cards', cards.length);
const box = await cards[1].boundingBox();
await p.mouse.move(box.x+box.width/2, box.y+box.height/2);
await new Promise(r=>setTimeout(r,1000));
const t = await p.evaluate(()=>{
  const els=[...document.querySelectorAll('a.hinge')];
  return els.slice(0,3).map(e=>{
    const pn=e.querySelector('.hinge-panel');
    return {hov:e.matches(':hover'), tr:getComputedStyle(pn).transform.slice(0,60), persp:getComputedStyle(e).perspective};
  });
});
console.log(JSON.stringify(t,null,1));
console.log('ERRORS', JSON.stringify(errs.slice(0,6),null,1));
await b.close();

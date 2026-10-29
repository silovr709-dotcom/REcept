import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
const b=await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:true});
const p=await b.newPage(); await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
await p.goto('http://localhost:3000'+(process.argv[2]||'/'),{waitUntil:'networkidle2',timeout:180000});
await new Promise(r=>setTimeout(r,1200));
console.log(await p.evaluate(()=>{
  const out=[];
  document.querySelectorAll('main > *, main > div > *').forEach(el=>{
    const r=el.getBoundingClientRect(); if(r.height<40) return;
    out.push(Math.round(r.height)+' px — '+el.tagName.toLowerCase()+'#'+(el.id||'—')+' «'+(el.innerText||'').trim().replace(/\s+/g,' ').slice(0,42)+'»');
  });
  out.push('ИТОГО '+document.body.scrollHeight);
  return out.join('\n');
}));
await b.close();

import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:true});
const p = await b.newPage(); await p.setViewport({width:1440,height:1000});
await p.goto('http://localhost:3000/',{waitUntil:'networkidle0',timeout:180000});
await new Promise(r=>setTimeout(r,1500));
await p.evaluate(()=>document.querySelector('[aria-labelledby="services-title"]').scrollIntoView());
await new Promise(r=>setTimeout(r,2500));
console.log(await p.evaluate(()=>{
  const sec=document.querySelector('[aria-labelledby="services-title"]');
  const rs=[...sec.querySelectorAll('[data-reveal]')];
  return {count:rs.length, revealed:rs.filter(r=>r.hasAttribute('data-revealed')).length,
   first: rs[0]&&{op:getComputedStyle(rs[0]).opacity, h:rs[0].getBoundingClientRect().height, top:Math.round(rs[0].getBoundingClientRect().top)},
   secH: sec.getBoundingClientRect().height};
}));
await p.screenshot({path:'/tmp/rev.png'});
await b.close();

import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:true});
const p = await b.newPage(); await p.setViewport({width:1440,height:900});
await p.goto('http://localhost:3000/',{waitUntil:'networkidle0',timeout:180000});
await new Promise(r=>setTimeout(r,2000));
console.log(await p.evaluate(()=>{
  const hand=[...document.querySelectorAll('*')].find(e=>getComputedStyle(e).fontFamily.includes('Marck')||getComputedStyle(e).fontFamily.includes('hand'));
  const h1=document.querySelector('h1'), h2=document.querySelector('h2');
  const fonts=[...document.fonts].map(f=>f.family+' '+f.weight).filter((v,i,a)=>a.indexOf(v)===i);
  return {hand: hand?getComputedStyle(hand).fontFamily:'—', h1:h1&&getComputedStyle(h1).fontFamily+' / '+getComputedStyle(h1).fontWeight, h2:h2&&getComputedStyle(h2).fontFamily.slice(0,30)+' / '+getComputedStyle(h2).fontWeight, fonts};
}));
await b.close();

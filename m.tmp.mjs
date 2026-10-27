import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ args:[...chromium.args,'--no-sandbox'], executablePath: await chromium.executablePath(), headless:true });
const p = await b.newPage();
for (const w of [1024,1100,1200,1280,1366,1440,1600]) {
  await p.setViewport({width:w,height:900});
  await p.goto('http://127.0.0.1:3000/kontakty',{waitUntil:'domcontentloaded',timeout:180000});
  await p.evaluate(()=>document.fonts.ready); await new Promise(r=>setTimeout(r,400));
  const r = await p.evaluate(()=>{
    const head=document.querySelector('header');
    const links=[...head.querySelectorAll('nav a, header > div a, header > div button')];
    const wrapped=links.filter(l=>{const b=l.getBoundingClientRect();return b.height>34 && l.textContent.trim().length>2 && l.tagName==='A';}).map(l=>l.textContent.trim().slice(0,20));
    const nav=head.querySelector('nav');
    return {wrapped, navW: nav?Math.round(nav.getBoundingClientRect().width):0};
  });
  console.log(String(w).padEnd(6), r.wrapped.length? 'ПЕРЕНОС: '+r.wrapped.join(' | ') : 'ок, меню шириной '+r.navW);
}
await b.close();

import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ args:[...chromium.args,'--no-sandbox'], executablePath: await chromium.executablePath(), headless:true });
for (const w of [390, 1440]) {
  const p = await b.newPage(); await p.setViewport({width:w,height:844});
  await p.goto('http://127.0.0.1:3000/',{waitUntil:'networkidle0',timeout:180000});
  await new Promise(r=>setTimeout(r,2000));
  const r = await p.evaluate(()=>{
    const h=document.querySelector('header');
    const cs=getComputedStyle(h);
    const hero=document.querySelector('[data-hero="dark"]');
    const cta=[...h.querySelectorAll('a,button')].find(e=>e.textContent.includes('Рассчитать'));
    return {scrollY:window.scrollY, headerBg:cs.backgroundColor, hasHero:!!hero,
      heroTop: hero? Math.round(hero.getBoundingClientRect().top):null,
      ctaBg: cta?getComputedStyle(cta).backgroundColor:null, ctaColor: cta?getComputedStyle(cta).color:null};
  });
  console.log(w, JSON.stringify(r));
  await p.close();
}
await b.close();

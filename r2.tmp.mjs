import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ args:[...chromium.args,'--no-sandbox'], executablePath: await chromium.executablePath(), headless:true });
const p = await b.newPage(); await p.setViewport({width:390,height:600});
await p.goto('http://127.0.0.1:3000/',{waitUntil:'networkidle0',timeout:180000});
await new Promise(r=>setTimeout(r,3000));
const r = await p.evaluate(()=>{
  const h=document.querySelector('header');
  return [...h.querySelectorAll('button,a')].map(e=>{
    const cs=getComputedStyle(e); const b=e.getBoundingClientRect();
    return `${e.tagName} "${e.textContent.trim().slice(0,20)}" ${Math.round(b.width)}x${Math.round(b.height)} bg=${cs.backgroundColor} color=${cs.color} border=${cs.borderColor}`;
  });
});
console.log(r.join('\n'));
await b.close();

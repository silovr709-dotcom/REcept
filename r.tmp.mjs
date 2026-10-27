import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ args:[...chromium.args,'--no-sandbox'], executablePath: await chromium.executablePath(), headless:true });
const p = await b.newPage(); await p.setViewport({width:390,height:600});
await p.goto('http://127.0.0.1:3000/',{waitUntil:'networkidle0',timeout:180000});
await new Promise(r=>setTimeout(r,3000));
const info = await p.evaluate(()=>{
  const out=[];
  document.elementsFromPoint(186,32).forEach(e=>{
    const cs=getComputedStyle(e);
    out.push(`${e.tagName}.${(e.className||'').toString().slice(0,60)} bg=${cs.backgroundColor}`);
  });
  return out;
});
console.log(info.join('\n'));
await b.close();

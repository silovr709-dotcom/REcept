import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:true});
for (const url of ['/','/kontakty']) {
  const p = await b.newPage();
  await p.setViewport({width:1440,height:900});
  await p.goto('http://localhost:3000'+url,{waitUntil:'domcontentloaded',timeout:120000});
  const out=[];
  for (const t of [250,600,1200,3000]) {
    await new Promise(r=>setTimeout(r,t===250?250:t-out.length*0));
    out.push([t, await p.evaluate(()=>{const l=document.querySelector('header a span');return l?getComputedStyle(l).color:'нет';})]);
  }
  console.log(url, JSON.stringify(out));
  await p.close();
}
await b.close();

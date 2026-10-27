import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:true});
const p = await b.newPage();
await p.setViewport({width:1440,height:900});
await p.goto('http://localhost:3000/',{waitUntil:'networkidle0',timeout:180000});
await new Promise(r=>setTimeout(r,1500));
const y = await p.evaluate(()=>{const d=document.querySelector('.cabinet-door');return d?d.getBoundingClientRect().top+window.scrollY:null;});
console.log('створки найдены на y =', y);
if (y!==null){
  for (const [k,off] of [['a',-760],['b',-650],['c',-540]]){
    await p.evaluate(v=>window.scrollTo(0,v), y+off);
    await new Promise(r=>setTimeout(r,700));
    await p.screenshot({path:`/tmp/door-${k}.png`});
    const t = await p.evaluate(()=>getComputedStyle(document.querySelector('.cabinet-door--l')).transform.slice(0,40));
    console.log(k, t);
  }
}
await b.close();

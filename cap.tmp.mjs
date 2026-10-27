import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
const [w,h,...jobs]=process.argv.slice(2);
const b=await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:true});
for(const job of jobs){
  const [url,sel,out]=job.split('|');
  const p=await b.newPage();
  await p.setViewport({width:+w,height:+h,deviceScaleFactor:1});
  await p.goto('http://localhost:3000'+url,{waitUntil:'networkidle0',timeout:180000});
  await new Promise(r=>setTimeout(r,1200));
  if(sel!=='TOP'){
    const ok=await p.evaluate(s=>{const e=document.querySelector(s); if(!e)return false; window.scrollTo(0, e.getBoundingClientRect().top+window.scrollY-40); return true;},sel);
    if(!ok) console.log('нет селектора',sel);
    await new Promise(r=>setTimeout(r,2200));
  }
  await p.screenshot({path:out});
  console.log('ok',out);
  await p.close();
}
await b.close();

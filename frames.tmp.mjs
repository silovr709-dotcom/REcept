import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
const path=process.argv[2], n=Number(process.argv[3]||8), step=Number(process.argv[4]||844), w=Number(process.argv[5]||390), h=Number(process.argv[6]||844);
const b=await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:true});
const p=await b.newPage(); await p.setViewport({width:w,height:h,isMobile:w<500,hasTouch:w<500,deviceScaleFactor:1});
await p.goto('http://localhost:3000'+path,{waitUntil:'networkidle2',timeout:180000});
await p.evaluate(()=>new Promise(r=>{let y=0;const i=setInterval(()=>{window.scrollTo(0,y);y+=500;if(y>document.body.scrollHeight){clearInterval(i);window.scrollTo(0,0);setTimeout(r,600);}},50);}));
const name=(path.replace(/\//g,'_')||'_home');
for(let i=0;i<n;i++){
  await p.evaluate(y=>window.scrollTo(0,y), i*step);
  await new Promise(r=>setTimeout(r,650));
  await p.screenshot({path:`/tmp/aud/f${w}${name}-${String(i).padStart(2,'0')}.png`});
}
console.log('frames ok', await p.evaluate(()=>document.body.scrollHeight));
await b.close();

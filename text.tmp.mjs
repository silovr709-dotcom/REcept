import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
const b=await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:true});
const p=await b.newPage(); await p.setViewport({width:1280,height:900});
for (const path of process.argv.slice(2)){
  await p.goto('http://localhost:3000'+path,{waitUntil:'networkidle2',timeout:180000});
  const t = await p.evaluate(()=>{
    const out=[];
    document.querySelectorAll('main section, main > div > section').forEach((s,i)=>{
      const txt=(s.innerText||'').replace(/\n{2,}/g,'\n').trim();
      out.push(`--- [${i}] #${s.id||'—'} (${txt.length} симв.)\n${txt}`);
    });
    return out.join('\n');
  });
  console.log('\n\n########## '+path+'\n'+t);
}
await b.close();

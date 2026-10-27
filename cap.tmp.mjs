import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
const [w,h,...jobs] = process.argv.slice(2);
const b = await puppeteer.launch({ args:[...chromium.args,'--no-sandbox'], executablePath: await chromium.executablePath(), headless:true });
const p = await b.newPage(); await p.setViewport({width:+w,height:+h});
for (const job of jobs) {
  const [url, sel, out] = job.split('|');
  await p.goto('http://127.0.0.1:3000'+url,{waitUntil:'networkidle0',timeout:180000});
  await p.evaluate(()=>document.fonts.ready);
  await new Promise(r=>setTimeout(r,1200));
  if (sel === 'TOP') { await p.screenshot({path:out}); console.log('ok',out); continue; }
  const el = await p.$(sel);
  if (!el) { console.log('НЕТ', sel, url); continue; }
  await el.evaluate(e=>e.scrollIntoView({block:'center'}));
  await new Promise(r=>setTimeout(r,700));
  await el.screenshot({path: out});
  console.log('ok', out);
}
await b.close();

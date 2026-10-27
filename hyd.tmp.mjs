import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:true});
const p = await b.newPage();
await p.setViewport({width:1440,height:900});
p.on('console',async m=>{if(m.type()==='error')console.log('--- '+m.text().slice(0,2000));});
await p.goto('http://localhost:3000/'+(process.argv[2]||''),{waitUntil:'networkidle0',timeout:120000});
await new Promise(r=>setTimeout(r,2500));
await b.close();

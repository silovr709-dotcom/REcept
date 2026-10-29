import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

// node shot2.tmp.mjs <path> <selector> <out> [w] [h] [offsetY]
const [path, sel, out, w = '390', h = '844', off = '0'] = process.argv.slice(2);
const b = await puppeteer.launch({
  args: [...chromium.args, '--no-sandbox'],
  executablePath: await chromium.executablePath(),
  headless: true,
});
const p = await b.newPage();
await p.setViewport({ width: +w, height: +h, isMobile: +w < 560, hasTouch: +w < 560 });
await p.goto('http://localhost:3000' + path, { waitUntil: 'networkidle2', timeout: 180000 });
await p.evaluate(
  () =>
    new Promise((r) => {
      let y = 0;
      const i = setInterval(() => {
        window.scrollTo(0, y);
        y += 600;
        if (y > document.body.scrollHeight) {
          clearInterval(i);
          setTimeout(r, 500);
        }
      }, 50);
    }),
);
await p.evaluate(
  (s, o) => {
    const el = document.querySelector(s);
    if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + Number(o));
  },
  sel,
  off,
);
await new Promise((r) => setTimeout(r, 900));
await p.screenshot({ path: out });
console.log('ok', out);
await b.close();

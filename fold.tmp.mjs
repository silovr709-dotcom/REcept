import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

const b = await puppeteer.launch({
  args: [...chromium.args, '--no-sandbox'],
  executablePath: await chromium.executablePath(),
  headless: true,
});
for (const [w, h] of [
  [390, 844],
  [360, 640],
]) {
  const p = await b.newPage();
  await p.setViewport({ width: w, height: h, isMobile: true, hasTouch: true });
  await p.goto('http://localhost:3000/', { waitUntil: 'networkidle2', timeout: 180000 });
  await new Promise((r) => setTimeout(r, 1800));
  const d = await p.evaluate(() => {
    const y = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return [Math.round(r.top + window.scrollY), Math.round(r.bottom + window.scrollY)];
    };
    const byText = (tag, re) => {
      const el = [...document.querySelectorAll(tag)].find((x) => re.test(x.textContent));
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return [Math.round(r.top + window.scrollY), Math.round(r.bottom + window.scrollY)];
    };
    return {
      photo: y('header ~ main img, main img'),
      h1: y('h1'),
      lead: y('h1 + p'),
      cta: byText('button', /Рассчитать мою кухню/),
      works: byText('a', /Посмотреть проекты/),
      rating: byText('a', /отзыва/),
      facts: y('dl'),
      vh: window.innerHeight,
      total: document.body.scrollHeight,
    };
  });
  console.log(w + 'x' + h, JSON.stringify(d));
  await p.screenshot({ path: `/tmp/aud/hero-${w}.png` });
  await p.close();
}
await b.close();

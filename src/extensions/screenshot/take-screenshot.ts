import puppeteer from 'puppeteer';
import { getComponentSize } from './helpers/get-component-size';

export async function takeScreenshot(url: string, path: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });
  await page.goto(url);
  const bounding_box = await getComponentSize(page);
  await page.screenshot({
    path,
    omitBackground: true,
    clip: {
      x: bounding_box.x,
      y: bounding_box.y,
      width: Math.min(bounding_box.width, page.viewport().width),
      height: Math.min(bounding_box.height, page.viewport().height),
    },
  });
  await browser.close();
}

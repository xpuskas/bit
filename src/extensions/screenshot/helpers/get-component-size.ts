import { Page, BoundingBox } from 'puppeteer';

export async function getComponentSize(page: Page): Promise<BoundingBox> {
  const defaultBoundingBox = {
    x: 0,
    y: 0,
    width: 1024,
    height: 768,
  };
  let bounding_box = defaultBoundingBox;

  const examplePage = await page.$('#anchor');

  if (examplePage) {
    const boundingBox = await examplePage.boundingBox();
    if (boundingBox) bounding_box = boundingBox;
  }
  //handle cases were width and height are zero
  const height = Math.min(bounding_box!.height, page.viewport().height);
  const width = Math.min(bounding_box!.width, page.viewport().width);
  bounding_box!.width = width !== 0 ? width : page.viewport().width;
  bounding_box!.height = height !== 0 ? height : page.viewport().height;

  return bounding_box;
}

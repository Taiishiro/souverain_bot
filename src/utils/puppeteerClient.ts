import puppeteer, { Browser } from 'puppeteer';

let browserInstance: Browser | null = null;

export async function getBrowser(): Promise<Browser> {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox', 
        '--disable-dev-shm-usage',
        '--use-gl=egl',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--no-zygote'
      ],
    });
  }
  return browserInstance;
}

export async function renderHtmlToBuffer(html: string, width: number, height: number): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  
  try {
    await page.setViewport({ width, height });
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 5000 });

    const waitPromise = page.evaluate(async () => {
      await document.fonts.ready;
      const images = Array.from(document.querySelectorAll('img'));
      await Promise.all(
        images.map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => { img.addEventListener('load', resolve); img.addEventListener('error', resolve); });
        })
      );
    });
    
    const timeoutPromise = new Promise(resolve => setTimeout(resolve, 5000));
    await Promise.race([waitPromise, timeoutPromise]);

    const buffer = await page.screenshot({ type: 'png', omitBackground: true, fullPage: true });
    return buffer as Buffer;
  } finally {
    await page.close();
  }
}

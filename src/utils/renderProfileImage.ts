import puppeteer from 'puppeteer';

/**
 * Génère une image PNG du profil joueur à partir d'un template HTML/CSS (médiéval-fantastique sombre).
 * @param html Le HTML à rendre (avec les valeurs dynamiques déjà injectées)
 * @param outputPath Chemin de sortie du PNG
 */
export async function renderProfileImage(html: string, outputPath: string) {
  // Réutilisation des flags optimisés
  const browser = await puppeteer.launch({ 
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox', 
      '--disable-dev-shm-usage',
      '--use-gl=egl',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--no-zygote'
    ] 
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 600, height: 340 });
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: outputPath, type: 'png' });
  await browser.close();
}

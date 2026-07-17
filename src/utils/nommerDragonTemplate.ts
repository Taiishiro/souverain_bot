import { getMangaLayout } from './mangaLayout';

/**
 * Génère le HTML complet pour le renommage d'un Dragon (Dark Manga/Seinen style).
 */
export function getNommerDragonHtml({
  ancienNom,
  nouveauNom,
  tiers,
}: {
  ancienNom: string;
  nouveauNom: string;
  tiers: string;
}): string {
  const innerCss = `
    .rename-container {
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 80%;
      height: auto;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 10;
      background: #000;
      border: 3px solid #fff;
      padding: 40px;
    }

    .rename-container::after {
      content: "";
      position: absolute;
      top: 6px;
      left: 6px;
      right: -10px;
      bottom: -10px;
      border: 2px solid #800000;
      z-index: -1;
    }

    .rename-container::before {
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image: radial-gradient(#333 1px, transparent 1px);
      background-size: 4px 4px;
      opacity: 0.3;
      z-index: 0;
    }

    .rename-title {
      position: relative;
      z-index: 1;
      font-family: 'Cinzel', serif;
      font-size: 32px;
      font-weight: 900;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 5px;
      margin-bottom: 30px;
      -webkit-text-stroke: 1px #800000;
      text-shadow: 4px 4px 0 #000, -2px -2px 0 #800000;
      transform: skewX(-5deg);
      text-align: center;
    }

    .names-box {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
      width: 100%;
    }

    .old-name {
      font-family: 'Montserrat', sans-serif;
      font-size: 24px;
      font-weight: 800;
      color: #555;
      text-decoration: line-through;
      text-decoration-color: #800000;
      text-decoration-thickness: 3px;
    }

    .arrow {
      font-size: 36px;
      color: #800000;
      transform: rotate(90deg);
      text-shadow: 2px 2px 0 #000;
      margin: 10px 0;
    }

    .new-name-box {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #800000;
      padding: 10px 20px;
      border: 2px solid #fff;
      transform: skewX(-10deg);
      box-shadow: 6px 6px 0 #000;
    }

    .new-name {
      font-family: 'Cinzel', serif;
      font-weight: 900;
      font-size: 36px;
      color: #fff;
      transform: skewX(10deg); /* Counter skew */
      letter-spacing: 2px;
    }

    .tiers-badge {
      font-family: 'Montserrat', sans-serif;
      font-size: 20px;
      font-weight: 900;
      color: #000;
      background: #fff;
      padding: 2px 8px;
      transform: skewX(10deg); /* Counter skew */
    }

    .panel-corner {
      position: absolute;
      width: 15px;
      height: 15px;
      background: #fff;
      z-index: 5;
    }
    .panel-corner.tl { top: -3px; left: -3px; }
    .panel-corner.tr { top: -3px; right: -3px; }
    .panel-corner.bl { bottom: -3px; left: -3px; }
    .panel-corner.br { bottom: -3px; right: -3px; }
  `;

  const innerHtml = `
    <div class="rename-container">
      <div class="panel-corner tl"></div>
      <div class="panel-corner tr"></div>
      <div class="panel-corner bl"></div>
      <div class="panel-corner br"></div>

      <div class="rename-title">RITUEL DE NOMMAGE</div>
      
      <div class="names-box">
        <div class="old-name">${ancienNom}</div>
        <div class="arrow">➔</div>
        <div class="new-name-box">
          <div class="new-name">${nouveauNom}</div>
          <div class="tiers-badge">T${tiers.replace('T', '')}</div>
        </div>
      </div>
    </div>
  `;

  return getMangaLayout(innerCss, innerHtml);
}

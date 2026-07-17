import { getMangaLayout } from './mangaLayout';

export function getInventaireHtml({
  username,
  avatarUrl,
  argent,
  royaumeNiveau,
  creaturesCount,
  artefacts
}: {
  username: string;
  avatarUrl: string;
  argent: string;
  royaumeNiveau: number;
  creaturesCount: number;
  artefacts: { nom: string; count: number }[];
}): string {
  
  const artefactsHtml = artefacts.length > 0 
    ? artefacts.map(a => `
      <div class="artefact-item">
        <span class="bullet manga-glow-red">>></span> 
        <span class="name">${a.nom}</span>
        <span class="count">x${a.count}</span>
      </div>
      `).join('')
    : `<div class="artefact-item" style="color: #666; font-style: italic;">Aucun artefact en possession...</div>`;

  const css = `
    .inventory-container {
      width: 100%;
      height: auto;
      display: flex;
      flex-direction: row;
      padding: 40px;
      box-sizing: border-box;
      gap: 30px;
    }
    .left-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transform: skewX(-3deg);
    }
    .avatar-bruh {
      width: 250px;
      height: 250px;
      object-fit: cover;
      border: 6px solid #000;
      border-radius: 50% 30% 60% 40% / 40% 60% 30% 50%;
      box-shadow: 10px 10px 0px rgba(139,0,0,0.8);
      filter: grayscale(30%) contrast(120%);
    }
    .title {
      font-size: 3em;
      margin-top: 20px;
      text-align: center;
      line-height: 1.1;
    }
    .stats-container {
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      gap: 15px;
      width: 100%;
      padding: 0 20px;
    }
    .stat-card {
      background: #000;
      border: 3px solid #E0E0E0;
      padding: 15px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 5px 5px 0px #8B0000;
      transform: skewX(-5deg);
    }
    .stat-label {
      font-weight: 900;
      color: #999;
      text-transform: uppercase;
      font-size: 1.2em;
    }
    .stat-value {
      font-weight: 900;
      font-size: 1.5em;
      color: #FFF;
    }
    
    .right-panel {
      flex: 1.5;
      background: rgba(15,15,15,0.9);
      border: 5px solid #000;
      box-shadow: 15px 15px 0px rgba(139,0,0,0.8);
      position: relative;
      z-index: 20;
      display: flex;
      flex-direction: column;
      transform: skewX(-2deg);
      padding: 30px;
      overflow: visible;
    }
    .right-panel::before {
      content: "";
      position: absolute;
      top:0; left:0; right:0; bottom:0;
      background-image: radial-gradient(#333 1.5px, transparent 1.5px);
      background-size: 10px 10px;
      opacity: 0.2;
      z-index: -1;
    }
    .inventaire-title {
      font-size: 2.5em;
      border-bottom: 5px solid #8B0000;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .artefact-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      flex: 1;
    }
    .artefact-item {
      display: flex;
      align-items: center;
      background: #000;
      padding: 15px 20px;
      border-left: 5px solid #B8860B;
      font-size: 1.4em;
    }
    .artefact-item .name {
      flex: 1;
      font-weight: 900;
      color: #FFF;
      text-transform: uppercase;
    }
    .artefact-item .count {
      font-weight: 900;
      color: #8B0000;
      font-size: 1.2em;
      text-shadow: 2px 2px 0px #000;
    }
  `;

  const html = `
    <div class="inventory-container">
      <div class="left-panel">
        <img class="avatar-bruh" src="${avatarUrl}" alt="avatar" crossorigin="anonymous" />
        <div class="title manga-glow">${username}</div>
        
        <div class="stats-container">
          <div class="stat-card">
            <span class="stat-label">Trésorerie</span>
            <span class="stat-value manga-glow-red">${argent} 💰</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Royaume</span>
            <span class="stat-value">Niv. ${royaumeNiveau} 🏰</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Créatures</span>
            <span class="stat-value">${creaturesCount} 🐉</span>
          </div>
        </div>
      </div>
      
      <div class="right-panel">
        <div class="inventaire-title manga-glow-red">ARTEFACTS POSSÉDÉS</div>
        <div class="artefact-list">
          ${artefactsHtml}
        </div>
      </div>
    </div>
  `;

  return getMangaLayout(css, html);
}

import { getMangaLayout } from './mangaLayout';

export function getRoyaumeCardHtml(params: {
    royaumeNom: string;
    souverainName: string;
    puissance: string;
    avatarUrl: string;
}): string {
  const css = `
    .royaume-container {
      width: 100%;
      height: auto;
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 40px;
      gap: 50px;
    }
    .left-panel {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
    }
    .avatar-bruh {
      width: 280px;
      height: 280px;
      object-fit: cover;
      border: 8px solid #000;
      border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
      box-shadow: 15px 15px 0px #8B0000;
      transform: skewX(-5deg);
      filter: grayscale(10%) contrast(120%);
    }
    .right-panel {
      flex: 1.5;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .crown-icon {
      font-size: 4em;
      margin-bottom: -20px;
      text-shadow: 5px 5px 0px #000;
      transform: rotate(-10deg);
      position: relative;
      z-index: 10;
    }
    .royaume-name {
      font-size: 3.5em;
      line-height: 1;
      margin-bottom: 20px;
      transform: skewX(-5deg);
    }
    .souverain-box {
      background: #000;
      border: 4px solid #E0E0E0;
      padding: 10px 20px;
      margin-bottom: 20px;
      transform: skewX(-5deg);
      width: fit-content;
      box-shadow: 8px 8px 0px #111;
    }
    .souverain-text {
      font-size: 1.5em;
      color: #999;
      font-weight: 900;
    }
    .souverain-text b {
      color: #B8860B;
      font-size: 1.2em;
    }
    .power-box {
      background: #8B0000;
      border: 4px solid #000;
      color: #FFF;
      font-size: 2.2em;
      font-weight: 900;
      padding: 15px 30px;
      width: fit-content;
      transform: skewX(-8deg) scale(1.05); /* Pop out slightly */
      box-shadow: 10px 10px 0px rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      gap: 15px;
      text-shadow: 3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000;
    }
  `;

  const html = `
    <div class="royaume-container">
      <div class="left-panel">
        <img class="avatar-bruh" src="${params.avatarUrl}" alt="Avatar" crossorigin="anonymous">
      </div>
      <div class="right-panel">
        <div class="crown-icon">👑</div>
        <div class="royaume-name manga-glow">${params.royaumeNom.toUpperCase()}</div>
        
        <div class="souverain-box">
          <div class="souverain-text">SOUVERAIN : <b>${params.souverainName.toUpperCase()}</b></div>
        </div>
        
        <div class="power-box">
          ⚔️ PUISSANCE : ${params.puissance}
        </div>
      </div>
    </div>
  `;

  return getMangaLayout(css, html);
}

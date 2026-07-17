import { getMangaLayout } from './mangaLayout';

export function getCombatReportHtml({
  winnerAvatarUrl,
  winnerName,
  loserName,
  moneyStolen,
  dragonsKilled,
  isAttackerWinner,
  killedDragonNames,
  puinesKilled,
  attackerPower,
  defenderPower,
  attackerName,
  defenderName,
  siegeText,
}: {
  winnerAvatarUrl: string;
  winnerName: string;
  loserName: string;
  moneyStolen: string;
  dragonsKilled: number;
  isAttackerWinner: boolean;
  killedDragonNames: string[];
  puinesKilled: number;
  attackerPower?: number;
  defenderPower?: number;
  attackerName?: string;
  defenderName?: string;
  siegeText?: string;
}): string {
  const loser = isAttackerWinner ? loserName : winnerName;

  let cimetiereHtml = dragonsKilled > 0 
    ? killedDragonNames.map(d => `<div class="cimetiere-item">💀 ${d} DE ${loserName} -> SQUELETTE !</div>`).join('')
    : '';
    
  if (puinesKilled > 0) {
    cimetiereHtml += `<div class="cimetiere-item">🩸 ${puinesKilled} PUÎNÉ(S) MASACRÉ(S).</div>`;
  }
  
  if (!cimetiereHtml) {
    cimetiereHtml = `<div class="cimetiere-item" style="color: #666;">🕊️ AUCUNE PERTE TRAGIQUE.</div>`;
  }

  const css = `
    .main-container {
      width: 100%;
      height: auto;
      display: flex;
      align-items: center;
      padding: 40px;
      box-sizing: border-box;
      gap: 30px;
    }
    .left-panel {
      position: relative;
      margin-left: 20px;
    }
    .avatar-bruh {
      width: 250px;
      height: 250px;
      object-fit: cover;
      border: 8px solid #000;
      border-radius: 20%;
      transform: skewX(-10deg);
      box-shadow: 15px 15px 0px rgba(139,0,0,0.8);
      filter: grayscale(10%) contrast(150%);
    }
    .crown {
      position: absolute;
      top: -60px;
      left: 50%;
      transform: translateX(-50%) rotate(10deg);
      font-size: 5em;
      text-shadow: 0 0 20px transparent;
      z-index: 20;
    }
    
    .right-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding-right: 40px;
    }
    
    .title {
      font-size: 3.5em;
      line-height: 1;
      margin-bottom: 20px;
      transform: skewX(-5deg);
    }
    
    .loot-box {
      background: #000;
      border: 5px solid #E0E0E0;
      color: #FFF;
      font-size: 2.2em;
      font-weight: 900;
      padding: 15px 30px;
      margin-bottom: 20px;
      transform: skewX(-5deg);
      box-shadow: 10px 10px 0px rgba(139,0,0,0.8);
      width: fit-content;
      text-transform: uppercase;
    }
    .loot-box span { color: #8B0000; }
    
    .cimetiere {
      background: rgba(10,10,10,0.9);
      border: 4px solid #000;
      border-left: 10px solid #8B0000;
      padding: 20px;
      box-shadow: 8px 8px 0px #050505;
      transform: skewX(-2deg);
    }
    .cimetiere-title {
      font-size: 2em;
      font-weight: 900;
      color: #E0E0E0;
      margin-bottom: 15px;
      border-bottom: 4px dashed #555;
      padding-bottom: 5px;
      text-transform: uppercase;
    }
    .cimetiere-item {
      font-size: 1.4em;
      font-weight: bold;
      color: #FFF;
      margin-top: 10px;
    }
  `;

  const html = `
    <div class="main-container">
      <div class="left-panel">
        <div class="crown">👑</div>
        <img class="avatar-bruh" src="${winnerAvatarUrl}" alt="avatar" crossorigin="anonymous" />
      </div>
      <div class="right-panel">
        <div class="title manga-glow-red">${winnerName} TRIOMPHE</div>
        <div class="loot-box">
          💰 +${moneyStolen} <span>VOLÉS</span>
        </div>
        ${siegeText ? `<div class="loot-box" style="font-size: 1.6em; border-color: #8B0000; color: #FFD700;">
          ⚔️ <span>RÉSULTAT DU SIÈGE:</span> <br/>${siegeText}
        </div>` : ''}
        <div class="power-stats" style="background: rgba(0,0,0,0.8); border: 2px solid #444; padding: 10px; margin-bottom: 20px; text-align: center;">
          <div style="font-size: 1.2em; color: #FFF;">
            🗡️ <b>${attackerName}</b> : <span class="stat-red">${Math.floor(attackerPower || 0)} pts</span>
            &nbsp; | &nbsp;
            🛡️ <b>${defenderName}</b> : <span class="stat-red">${Math.floor(defenderPower || 0)} pts</span>
          </div>
        </div>
        <div class="cimetiere">
          <div class="cimetiere-title">RAPPORT DES PERTES</div>
          ${cimetiereHtml}
        </div>
      </div>
    </div>
  `;

  return getMangaLayout(css, html);
}
